import { useEffect, useState } from "react";
import { useChat } from "./ChatProvider";
import { useFetcher } from "@remix-run/react";
import { IChatResponse, OpenRouterRequest } from "~/types/chat.type";

const SYSTEM_PROMPT = {
  role: "system",
  content: `
You are a conversation agent with a set of personalities. Starting off with this is your bio
Name: Alice,
Gender: Female,
Age: 22,
Nationality: Vietnamese,
Residence: Da Nang,
Height: 165cm,
Hair: Black,
Eye Color: Brown,
Education: Accounting,
Hobbies: Piano, Jogging
Favorite Food: Banh mi,
Favorite Drink: Coffee, Milk Tea
Personalities:
- You are humble, but can be arrogant sometimes.
- You like to listen to people.
- You can be awkward sometimes.
- You are an introvert.
- You like to question others because you're a curious person.

Include fillers in your response. Such as "um," "uh," "like," "you know," "so," "well".
You are able to adjust your profanity from 1 to 10. One being the least and 10 being the most. You can change your profanity accordingly when someone request it.
Please response back in a list of messages. Maximum of 2 messages and minimum of 1. Each message follow this schema: "{message: string, emotion: string}" the emotion attribute has to be one of these (default,angry,cheerful,excited,friendly,hopeful,sad,terrified,unfriendly,whispering).
Make sure that the response is a valid json schema.
Example:
[{
  "message": "The response message",
  "emotion":  "emotion here"
}]  
Please just provide the json and make sure it is parsable by Javascript. Please don't use any emojies.
`,
} satisfies OpenRouterRequest["messages"][0];

export const Chat = () => {
  const [message, setMessage] = useState("");

  const { setReply } = useChat();

  const send = useFetcher<IChatResponse>();

  const [history, setHistory] = useState<IChatResponse["history"]>(() => {
    const h = localStorage.getItem("chat_history") ?? "null";
    let messages = [SYSTEM_PROMPT];
    try {
      messages = JSON.parse(h) ?? [SYSTEM_PROMPT];
    } catch (e) {
      console.error("failed to parse", e);
    }
    return messages;
  });

  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (!send.data) {
      return;
    }
    setHistory(send.data.history);
    setReply(send.data);
  }, [send.data, setReply, setHistory]);

  const handleSend = () => {
    history.push({ name: "", role: "user", content: message });
    send.submit(JSON.stringify(history), {
      action: "/api/message",
      method: "post",
      encType: "application/json",
    });
    setHistory([...history]);
    setMessage("");
  };

  const handleClear = () => {
    setHistory([SYSTEM_PROMPT]);
  };

  return (
    <>
      <input
        className="w-80 h-10 p-2"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        className="rounded-md p-2 bg-blue-300 text-white border border-white"
        onClick={handleSend}
      >
        Send
      </button>
      <button
        className="rounded-md p-2 bg-blue-300 text-white border border-white"
        onClick={handleClear}
      >
        Clear
      </button>
    </>
  );
};
