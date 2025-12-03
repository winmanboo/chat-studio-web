"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Upload, message, theme } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { uploadDocumentWithForm, type DocumentUploadParams, getDictItems, getDocumentTags, type DictItem } from '@/lib/api';

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
  const { token } = theme.useToken();
  const [uploadForm] = Form.useForm();
  const [sourceType, setSourceType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [storageTypes, setStorageTypes] = useState<DictItem[]>([]);
  const [loadingDict, setLoadingDict] = useState(false);
  
  // 静态来源类型数据
  const sourceTypes = [
    { code: 'WEB', name: '网络链接' },
    { code: 'UPLOAD', name: '文件上传' }
  ];
  const [availableTags, setAvailableTags] = useState<Array<{ id: number; name: string }>>([]);

  // 获取字典数据
  const fetchDictData = async () => {
    try {
      setLoadingDict(true);
      const [storageTypeData, tagsData] = await Promise.all([
        getDictItems('storage_type'),
        getDocumentTags()
      ]);
      setStorageTypes(storageTypeData);
      setAvailableTags(tagsData);
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
    return type === 'UPLOAD';
  };

  // 判断是否为网络链接类型
  const isWebType = (type: string) => {
    return type === 'WEB';
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
    tags?: string[];
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

      // 处理标签数据
      const tags = values.tags?.map((tag: string) => {
        try {
          // 尝试解析为已有标签
          return JSON.parse(tag);
        } catch {
          // 如果解析失败，说明是新输入的标签
          return { name: tag };
        }
      }) || [];

      const uploadParams: DocumentUploadParams = {
        title: values.title,
        storageType: values.storageType,
        sourceType: values.sourceType,
        description: values.description,
        uploadFileUrl: values.uploadFileUrl,
        tags: tags.length > 0 ? tags : undefined
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
        <div style={{ fontSize: 16, fontWeight: 600, color: token.colorText }}>
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
      width={640}
      confirmLoading={uploading}
      styles={{
        body: { padding: '24px 0 0 0' }
      }}
    >
      <Form
        form={uploadForm}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div style={{ padding: '0 24px' }}>
          <Form.Item
            label="文档标题"
            name="title"
            rules={[{ required: true, message: '请输入文档标题' }]}
          >
            <Input placeholder="请输入文档标题" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="存储类型"
              name="storageType"
              rules={[{ required: true, message: '请选择存储类型' }]}
              style={{ flex: 1 }}
            >
              <Select 
                placeholder="请选择存储类型" 
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
              label="文件来源"
              name="sourceType"
              rules={[{ required: true, message: '请选择文件来源类型' }]}
              style={{ flex: 1 }}
            >
              <Select 
                placeholder="请选择文件来源类型"
                onChange={(value) => setSourceType(value)}
              >
                {sourceTypes.map(item => (
                  <Select.Option key={item.code} value={item.code}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {isUploadType(sourceType) && (
            <Form.Item
              label="上传文件"
              name="file"
              rules={[{ required: true, message: '请选择要上传的文件' }]}
            >
              <Upload.Dragger
                name="file"
                beforeUpload={() => false}
                maxCount={1}
                style={{ 
                  padding: '20px', 
                  borderRadius: token.borderRadius,
                  background: token.colorFillAlter,
                  border: `1px dashed ${token.colorBorder}`
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 36, color: token.colorPrimary }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 14, margin: '8px 0', color: token.colorText }}>
                  点击或拖拽文件到此区域
                </p>
                <p className="ant-upload-hint" style={{ fontSize: 12, color: token.colorTextSecondary }}>
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
            >
              <Input 
                placeholder="请输入文件下载链接地址"
                prefix={<LinkOutlined style={{ color: token.colorTextTertiary }} />}
              />
            </Form.Item>
          )}

          <Form.Item
            label="标签"
            name="tags"
          >
            <Select
              mode="tags"
              placeholder="请选择或输入标签"
              loading={loadingDict}
              tokenSeparators={[',', ' ']}
              options={availableTags.map(tag => ({
                label: tag.name,
                value: JSON.stringify({ id: tag.id, name: tag.name })
              }))}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
              }
            />
          </Form.Item>

          <Form.Item
            label="文档描述"
            name="description"
          >
            <Input.TextArea 
              placeholder="请输入文档描述（可选）"
              rows={3}
              style={{ resize: 'none' }}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default DocumentUploadModal;
