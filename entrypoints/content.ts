// 定义消息类型的接口，便于类型检查和扩展
interface Message {
  source: "popup" | "content" | "background";
  target: "popup" | "content";
  type: string;
  content: string | object;
}

interface Response {
  status: "success" | "error";
  message?: string;
  data?: Array<{ text: string; href: string }>; // 用于表格数据
}

/**
 * 定义内容脚本，运行在网页上下文中，处理来自背景脚本或 popup 的消息
 */
export default defineContentScript({
  matches: ["*://*/*"], // 在所有 HTTP/HTTPS 页面上运行
  runAt: "document_idle", // 等待页面加载完成再运行

  main() {
    console.log("Content script loaded on:", window.location.href);

    // 注册消息监听器
    browser.runtime.onMessage.addListener(
      async (message: Message, sender, sendResponse) => {
        console.log("Content script received message:", message);
        console.log("Sender:", sender);

        try {
          // 处理提取表格数据的请求
          if (message.type === "extract_table_data") {
            const response = await handleExtractTableData();
            sendResponse(response);
          }

          // 处理来自 popup 的消息
          else if (message.type === "popup-message") {
            const response = handlePopupMessage(message);
            sendResponse(response);
          }

          // 默认响应（未识别的消息类型）
          else {
            const response = handleUnknownMessage();
            sendResponse(response);
          }

          // 返回 true 表示异步响应
          return true;
        } catch (error) {
          handleErrorResponse(error);
          sendResponse({
            status: "error",
            message: `Content script error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          } as Response);
          return true;
        }
      }
    );
  },
});

/**
 * 处理提取表格数据的请求
 */
async function handleExtractTableData(): Promise<Response> {
  try {
    const tableData = extractTableData();
    return {
      status: "success",
      message: "Table data extracted",
      data: tableData,
    } as Response;
  } catch (error) {
    handleErrorResponse(error);
    return {
      status: "error",
      message: `Error extracting table data: ${(error as Error).message}`,
    } as Response;
  }
}

/**
 * 处理来自 popup 的消息
 * @param message 收到的消息
 * @returns 响应对象
 */
function handlePopupMessage(message: Message): Response {
  console.log("Content received popup message:", message.content);
  return {
    status: "success",
    message: `Content received: ${message.content}`,
  } as Response;
}

/**
 * 处理未识别的消息类型
 * @returns 响应对象
 */
function handleUnknownMessage(): Response {
  return {
    status: "success",
    message: "Content is working from anywhere",
  } as Response;
}

/**
 * 错误处理函数
 * @param error 错误对象
 */
function handleErrorResponse(error: any): void {
  console.error("Error in content script:", error);
}

/**
 * 提取页面中的表格数据或链接
 * @returns 包含文本和链接的对象数组
 */
function extractTableData(): Array<{ text: string; href: string }> {
  try {
    // 示例：提取所有 <a> 标签的数据
    const links = Array.from(document.querySelectorAll("a")).map((a) => ({
      text: a.textContent?.trim() || "",
      href: a.href,
    }));

    // 如果需要提取真正的表格数据，可以替换为以下逻辑：
    /*
    const tables = document.querySelectorAll('table');
    const tableData: Array<{ text: string; href: string }> = [];
    for (const table of tables) {
      const rows = table.querySelectorAll('tr');
      for (const row of rows) {
        const cells = row.querySelectorAll('td, th');
        for (const cell of cells) {
          const link = cell.querySelector('a');
          if (link) {
            tableData.push({
              text: link.textContent?.trim() || '',
              href: link.href,
            });
          }
        }
      }
    }
    return tableData;
    */

    console.log("Extracted table data:", links);
    return links;
  } catch (error) {
    console.error("Error extracting table data:", error);
    return [];
  }
}
