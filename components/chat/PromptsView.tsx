import React from "react";
import { Prompts } from "@ant-design/x";
import {
  BulbOutlined,
  CodeOutlined,
  ReadOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { theme } from "antd";

interface PromptsViewProps {
  onItemClick: (prompt: string) => void;
}

const PromptsView: React.FC<PromptsViewProps> = ({ onItemClick }) => {
  const { token } = theme.useToken();

  const items = [
    {
      key: "1",
      icon: <BulbOutlined style={{ color: "#FFD700" }} />,
      label: "解释量子物理",
      description: "用简单的语言解释量子纠缠",
    },
    {
      key: "2",
      icon: <CodeOutlined style={{ color: "#1890FF" }} />,
      label: "代码调试",
      description: "帮我找出这段 Python 代码的错误",
    },
    {
      key: "3",
      icon: <ReadOutlined style={{ color: "#52C41A" }} />,
      label: "写一首诗",
      description: "关于秋天的七言绝句",
    },
    {
      key: "4",
      icon: <RocketOutlined style={{ color: "#722ED1" }} />,
      label: "制定旅行计划",
      description: "去日本京都的5天行程安排",
    },
  ];

  return (
    <Prompts
      title="✨ 猜你想问"
      items={items}
      styles={{
        list: {
          width: "100%",
        },
        item: {
          flex: 1,
        },
      }}
      onItemClick={(info) => {
        // info.data is the item object
        if (info.data && info.data.description) {
           onItemClick(info.data.description as string);
        } else if (info.data && info.data.label) {
           onItemClick(info.data.label as string);
        }
      }}
    />
  );
};

export default PromptsView;
