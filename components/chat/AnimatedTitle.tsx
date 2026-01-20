import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import classNames from "classnames";
import styles from "./AnimatedTitle.module.css";

interface AnimatedTitleProps {
  text?: string;
  style?: React.CSSProperties;
  className?: string;
}

const SLOGANS = [
  "你好呀～今天想聊点什么？",
  "我在这儿呢，有什么问题尽管问吧！",
  "无论大事小事，我都很乐意听你说",
  "今天的心情如何？需要我陪你聊聊吗？",
  "嗨，我是你的AI伙伴，随时为你效劳～",
  "有什么好奇的、困惑的？我来帮你解答！",
  "别犹豫，你的每一个问题都值得被认真对待",
  "想探索知识？还是只想闲聊？我都可以！",
  "世界很大，问题很多——但你有我",
  "从天文地理到生活琐事，问我就好！"
];

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text, style, className }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    const targetText = text || SLOGANS[Math.floor(Math.random() * SLOGANS.length)];
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= targetText.length) {
        setDisplayText(targetText.slice(0, currentIndex));
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
      className={classNames(styles.container, className)}
      style={style as any}
    >
      <span>{displayText}</span>
      {!isTypingComplete && (
        <motion.span
          variants={cursorVariants}
          animate="blinking"
          className={styles.cursor}
        />
      )}
    </div>
  );
};

export default AnimatedTitle;
