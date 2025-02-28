<script lang="ts" setup>
// 导入必要的依赖
import { ref, onBeforeUpdate } from 'vue';
import HelloWorld from '@/components/HelloWorld.vue';

// 定义响应式数据，用于存储表格数据
const tableData = ref<Array<{ text: string; href: string }>>([]);

// 在组件更新前执行，检查所有标签页并向内容脚本发送消息
onBeforeUpdate(async () => {
    console.log('Popup mounted or updated!');
    try {
        // 获取所有打开的标签页
        const allTabs = await browser.tabs.query({});
        // 定义内容脚本的匹配模式，适用于所有 HTTP/HTTPS 页面
        const contentScriptMatches = new MatchPattern('*://*/*');
        // 筛选出与内容脚本匹配的标签页
        const contentScriptTabs = allTabs.filter(
            (tab) =>
                tab.id != null &&
                tab.url != null &&
                contentScriptMatches.includes(tab.url)
        );

        // 向所有匹配的标签页发送消息，并收集响应
        const results = await Promise.all(
            contentScriptTabs.map(async (tab) => {
                const response = await browser.tabs.sendMessage(
                    tab.id!, // 使用非空断言，确保 tab.id 存在
                    'background-message is working!' // 发送简单的字符串消息
                );
                return { tab: tab.id, response };
            })
        );
        console.log('Results from content scripts:', results);
    } catch (error) {
        console.error('Error in onBeforeUpdate:', error);
    }
});

/**
 * 获取当前页面表格数据的函数
 * 通过背景脚本请求内容脚本提取数据，并更新 tableData
 */
async function getTable() {
    console.log('发送获取表格数据的消息');
    try {
        // 向背景脚本发送消息，请求表格数据
        browser.runtime.sendMessage({ type: 'get_table_data' }, (response) => {
            console.log('收到数据：', response);
            if (browser.runtime.lastError) {
                console.error('消息发送失败:', browser.runtime.lastError);
                return;
            }
            if (response && response.length > 0) {
                tableData.value = response; // 更新表格数据
            } else {
                console.log('未收到表格数据');
            }
        });
    } catch (error) {
        console.error('getTable error:', error);
    }
}

/**
 * 处理按钮点击事件，向背景脚本和当前标签页发送消息
 */
const handleClick = async () => {
    console.log('Popup button clicked!');
    try {
        // 向背景脚本发送消息
        const backgroundResponse = await browser.runtime.sendMessage({

            source: "popup",
            target: "background",
            type: "info",
            content: "popup-message",
        });
        console.log('Popup收到背景脚本响应：', backgroundResponse);

        // 获取当前活动标签页
        const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (currentTab?.id) {
            // 向当前标签页的内容脚本发送消息
            const contentResponse = await browser.tabs.sendMessage(
                currentTab.id,
                { type: 'popup-message', content: 'Hello from popup!' }
            );
            console.log('Popup收到内容脚本响应:', contentResponse);
        } else {
            console.log('未找到当前活动标签页');
        }
    } catch (error) {
        console.error('handleClick error:', error);
    }
};
</script>

<template>
    <div>
        <!-- 发送消息按钮 -->
        <button type="button" @click="handleClick">发送信息</button>
        <!-- 获取表格数据按钮 -->
        <button type="button" @click="getTable">获取表格</button>
        <!-- 显示表格数据（如果存在） -->
        <div v-if="tableData.length > 0">
            <h3>找到的链接：</h3>
            <ul>
                <li v-for="(item, index) in tableData" :key="index">
                    <a :href="item.href" target="_blank">{{ item.text || '无文本' }}</a>
                </li>
            </ul>
        </div>
        <!-- HelloWorld 组件 -->
        <HelloWorld msg="WXT + Vue" />
    </div>
</template>

<style scoped>
/* 按钮样式 */
button {
    padding: 8px 16px;
    background: #42b883;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
    /* 添加间距以分隔按钮 */
}

/* 按钮悬停效果 */
button:hover {
    background: #33a06f;
}

/* 列表容器样式 */
ul {
    max-height: 300px;
    overflow-y: auto;
    padding: 0;
    list-style: none;
}

/* 列表项样式 */
li {
    margin: 8px 0;
}

/* 链接样式 */
a {
    color: #42b883;
    text-decoration: none;
}

/* 链接悬停效果 */
a:hover {
    text-decoration: underline;
}
</style>