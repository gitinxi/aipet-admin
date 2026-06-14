import request from './request'

/**
 * 上传文件到服务器
 * @param {File} file - 要上传的文件对象
 * @returns {Promise<string>} 返回文件URL
 */
export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await request.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response
}
