export interface serverType {
  /**
   * 服务器模式
   * - 0: 使用远程服务
   * - 1: 使用本地服务, 启动本地服务
   * */
  mode: 0 | 1
  /** 自定义服务器地址 */
  url: string
  /** 服务端口 */
  port: number
  /** 最大重试次数 */
  retry: number
  /** 使用base64上传图片 */
  usebase64: boolean
  /** 超时时间 */
  timeout: number
  /** 下载地址 */
  proxy_url: string
  /** 服务端资源下载地址 */
  download_url: string
}
