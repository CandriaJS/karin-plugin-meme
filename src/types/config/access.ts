export interface accessType {
  /** 是否开启名单限制 */
  enable: boolean
  /** 是否开启表情限制 */
  memeEnable: boolean
  /**  名单限制模式（白名单：0，黑名单：1） */
  accessMode: 0 | 1
  /** 表情限制模式（白名单：0，黑名单：1） */
  memeMode: 0 | 1

  /** 用户黑白名单 */
  accessList: Array<
    {
      groupId: string;
      whiteUser: string[];
      blackUser: string[];
    }
  >;

  /** 启用/禁用表情 */
  memeAccessList: Array<
  {
    groupId: string;
    whiteMeme: string[];
    blackMeme: string[];
  }>;
}
