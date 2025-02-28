/**
 * 异步函数：用于发送消息给后台脚本
 *
 * @param source 消息的发送者标识
 * @param target 消息的目标接收者标识
 * @param type 消息类型，不能为空
 * @param content 消息内容，可以是字符串或对象
 * @returns 返回一个Promise，表示消息发送操作的结果
 */
export async function useSendMessage(
  source: string,
  target: string,
  type: string,
  content: string | object
): Promise<any> {
  // 函数调用日志，输出传入的参数
  //   console.log("useSendMessage", source, target, type, content);

  // 检查消息类型是否为空
  if (!type) {
    // 如果消息类型为空，则记录错误并拒绝Promise
    console.error("消息类型不能为空");
    return Promise.reject(new Error("消息类型不能为空"));
  }

  // 返回一个新的Promise对象，处理消息发送的异步操作
  return new Promise((resolve, reject) => {
    // 发送消息给后台脚本
    browser.runtime.sendMessage(
      {
        // 构造消息对象，包含类型、目标和内容
        source,
        target,
        type,
        content,
      },
      (response) => {
        // 检查是否有错误发生
        if (browser.runtime.lastError) {
          // 如果有错误，记录错误并拒绝Promise
          console.error("消息发送失败:", browser.runtime.lastError);
          return reject(browser.runtime.lastError);
        }

        // 如果没有错误，记录响应并解析Promise
        console.log("后台脚本响应:", response);
        resolve(response);
      }
    );
  });
}
