import React, {
  createContext,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ILipSync } from "~/types/chat.type";

const ChatContext = createContext<{
  reply: { audio: string; lipsync?: ILipSync };
  setReply: React.Dispatch<
    SetStateAction<{ audio: string; lipsync?: ILipSync }>
  >;
}>({
  reply: { audio: "" },
  setReply: () => {},
});

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error(
      "This context is not under chat provider. Instantiate chat provider to start using this hook"
    );
  }
  return context;
};

export const ChatProvider = ({ children }: PropsWithChildren) => {
  const [reply, setReply] = useState<{
    audio: string;
    lipsync?: ILipSync;
  }>({ audio: "" });

  return (
    <ChatContext.Provider value={{ reply, setReply }}>
      {children}
    </ChatContext.Provider>
  );
};
