// 定义消息类型的接口，便于类型检查和扩展
interface Message {
  source: "popup" | "content" | "background";
  target: "popup" | "content";
  type: string;
  content: string | object;
}

interface Response {
  source: "popup" | "content" | "background";
  target: "popup" | "content";
  type: string;
  content: string | object;
}

/**
 * 定义背景脚本，处理来自 popup 和 content script 的消息
 */
export default defineBackground(() => {
  // 注册消息监听器
  browser.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      try {
        // 处理来自 content script 的消息
        if (message.source === "content") {
          console.log("Background received content message:", message.content);
          sendResponse({
            source: "background",
            target: "content",
            type: "response",
            content: "Message received",
          } as Response);
        }

        // 处理来自 popup 的消息
        else if (message.source === "popup") {
          console.log("Background received popup message:", message.content);
          sendResponse({
            source: "background",
            target: "popup",
            type: "response",
            content: "Message received",
          } as Response);
        }

        // 处理获取表格数据的请求（与 popup 的 getTable 函数对应）
        else if (message.type === "get_table_data") {
          // 获取当前活动标签页
          browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab?.id) {
              // 向内容脚本发送消息提取表格数据
              browser.tabs.sendMessage(
                tab.id,
                { type: "extract_table_data" },
                (response) => {
                  if (browser.runtime.lastError) {
                    console.error(
                      "Failed to send message to content script:",
                      browser.runtime.lastError
                    );
                    sendResponse({
                      source: "background",
                      target: "popup",
                      type: "response",
                      content: "Message received",
                    } as Response);
                  } else {
                    sendResponse(response); // 将内容脚本的响应传回 popup
                  }
                }
              );
            } else {
              sendResponse({
                source: "background",
                target: "popup",
                type: "response",
                content: "Message received",
              } as Response);
            }
          });
        }

        // 未识别的消息类型
        else {
          console.warn("Unknown message type:", message.type);
          sendResponse({
            source: "background",
            target: "popup",
            type: "response",
            content: "Message received",
          } as Response);
        }

        // 返回 true 表示异步响应
        return true;
      } catch (error) {
        console.error("Error in background script:", error);
        sendResponse({
          source: "background",
          target: "popup",
          type: "response",
          content: "Message received",
        } as Response);
        return true;
      }
    }
  );
});
