import request from './request';

export const uploadFile = (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  return request.post<string>('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) as unknown as Promise<string>;
};
