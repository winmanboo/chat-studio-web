"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { uploadDocumentWithForm, type DocumentUploadParams, getDictItems, type DictItem } from '@/lib/api';

interface DocumentUploadModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  kbId: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  kbId
}) => {
  const [uploadForm] = Form.useForm();
  const [sourceType, setSourceType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [storageTypes, setStorageTypes] = useState<DictItem[]>([]);
  const [sourceTypes, setSourceTypes] = useState<DictItem[]>([]);
  const [loadingDict, setLoadingDict] = useState(false);

  // 获取字典数据
  const fetchDictData = async () => {
    try {
      setLoadingDict(true);
      const [storageTypeData, sourceTypeData] = await Promise.all([
        getDictItems('storage_type'),
        getDictItems('source_type')
      ]);
      setStorageTypes(storageTypeData);
      setSourceTypes(sourceTypeData);
    } catch (error) {
      console.error('获取字典数据失败:', error);
      message.error('获取字典数据失败');
    } finally {
      setLoadingDict(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchDictData();
    }
  }, [visible]);

  // 判断是否为上传类型
  const isUploadType = (type: string) => {
    const uploadItem = sourceTypes.find(item => item.code === type);
    return uploadItem?.name?.includes('上传') || uploadItem?.name?.includes('文件');
  };

  // 判断是否为网络链接类型
  const isWebType = (type: string) => {
    const webItem = sourceTypes.find(item => item.code === type);
    return webItem?.name?.includes('网络') || webItem?.name?.includes('链接') || webItem?.name?.includes('URL');
  };

  const handleCancel = () => {
    uploadForm.resetFields();
    setSourceType('');
    onCancel();
  };

  const handleSubmit = async (values: {
    title: string;
    storageType: string;
    sourceType: string;
    description?: string;
    uploadFileUrl?: string;
    file?: {
      fileList: Array<{
        originFileObj: File;
      }>;
    };
  }) => {
    try {
      setUploading(true);
      
      if (!kbId) {
        message.error('缺少知识库ID参数');
        return;
      }

      const uploadParams: DocumentUploadParams = {
        title: values.title,
        storageType: values.storageType,
        sourceType: values.sourceType,
        description: values.description,
        uploadFileUrl: values.uploadFileUrl
      };

      let file: File | undefined;
      if (isUploadType(values.sourceType) && values.file?.fileList && values.file.fileList.length > 0) {
        file = values.file.fileList[0].originFileObj;
      }

      await uploadDocumentWithForm(kbId, uploadParams, file);
      
      if (isUploadType(values.sourceType) && file) {
        message.success(`文档 "${values.title}" 上传成功`);
      } else if (isWebType(values.sourceType)) {
        message.success(`文档 "${values.title}" 创建成功`);
      }
      
      uploadForm.resetFields();
      setSourceType('');
      onSuccess();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '上传失败';
      message.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#262626' }}>
          上传文档
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={() => {
        uploadForm.submit();
      }}
      okText="确认上传"
      cancelText="取消"
      width={700}
      confirmLoading={uploading}
      styles={{
        body: { padding: '24px 24px 16px 24px' }
      }}
    >
      <Form
        form={uploadForm}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="文档标题"
          name="title"
          rules={[{ required: true, message: '请输入文档标题' }]}
          style={{ marginBottom: 20 }}
        >
          <Input placeholder="请输入文档标题" size="large" />
        </Form.Item>

        <Form.Item
          label="存储类型"
          name="storageType"
          rules={[{ required: true, message: '请选择存储类型' }]}
          style={{ marginBottom: 20 }}
        >
          <Select 
            placeholder="请选择存储类型" 
            size="large"
            loading={loadingDict}
          >
            {storageTypes.map(item => (
              <Select.Option key={item.code} value={item.code}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="来源类型"
          name="sourceType"
          rules={[{ required: true, message: '请选择来源类型' }]}
          style={{ marginBottom: 20 }}
        >
          <Select 
            placeholder="请选择来源类型"
            size="large"
            loading={loadingDict}
            onChange={(value) => setSourceType(value)}
          >
            {sourceTypes.map(item => (
              <Select.Option key={item.code} value={item.code}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {isUploadType(sourceType) && (
          <Form.Item
            label="上传文件"
            name="file"
            rules={[{ required: true, message: '请选择要上传的文件' }]}
            style={{ marginBottom: 20 }}
            wrapperCol={{ span: 18, offset: 0 }}
          >
            <Upload.Dragger
              name="file"
              beforeUpload={() => false}
              maxCount={1}
              style={{ padding: '20px', borderRadius: '8px' }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 36, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: '16px', margin: '8px 0' }}>
                点击或拖拽文件到此区域
              </p>
              <p className="ant-upload-hint" style={{ fontSize: '14px', color: '#999' }}>
                支持 PDF、DOC、DOCX、TXT 等格式
              </p>
            </Upload.Dragger>
          </Form.Item>
        )}

        {isWebType(sourceType) && (
          <Form.Item
            label="文件链接"
            name="uploadFileUrl"
            rules={[
              { required: true, message: '请输入文件下载链接' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input 
              placeholder="请输入文件下载链接地址"
              prefix={<LinkOutlined style={{ color: '#1890ff' }} />}
              size="large"
            />
          </Form.Item>
        )}

        <Form.Item
          label="文档描述"
          name="description"
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea 
            placeholder="请输入文档描述（可选）"
            rows={3}
            style={{ resize: 'none' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DocumentUploadModal;