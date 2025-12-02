import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

interface AnimatedTitleProps {
  text: string;
  style?: React.CSSProperties;
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text, style }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 100); // 每个字符间隔 100ms，模拟打字速度

    return () => clearInterval(timer);
  }, [text]);

  // 光标动画
  const cursorVariants: Variants = {
    blinking: {
      opacity: [0, 0, 1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatDelay: 0,
        ease: "linear",
        times: [0, 0.5, 0.5, 1]
      }
    }
  };

  return (
    <div
      style={{
        ...style,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span>{displayText}</span>
      {!isTypingComplete && (
        <motion.span
          variants={cursorVariants}
          animate="blinking"
          style={{
            display: "inline-block",
            width: "2px", // 光标宽度
            height: "1em", // 光标高度跟随字体大小
            backgroundColor: "currentColor", // 使用当前文本颜色
            marginLeft: "2px", // 光标与文本的间距
            verticalAlign: "middle", // 垂直对齐
          }}
        />
      )}
    </div>
  );
};

export default AnimatedTitle;
