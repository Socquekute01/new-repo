import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { chatbotAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ChatbotWidget = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedHistory = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !isAuthenticated || hasLoadedHistory.current) return;
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setError("");
      try {
        const response = await chatbotAPI.getHistory();
        const logs = Array.isArray(response?.data) ? response.data : [];
        const history = logs
          .slice()
          .reverse()
          .flatMap((log) => {
            const items = [];
            if (log?.message) {
              items.push({ role: "user", text: log.message });
            }
            if (log?.response) {
              items.push({ role: "assistant", text: log.response });
            }
            return items;
          });
        setMessages(history);
        hasLoadedHistory.current = true;
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending, isOpen, isLoadingHistory]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setIsSending(true);

    try {
      const response = await chatbotAPI.chat({ message });
      const reply = response?.data?.response || response?.data?.message;
      const suggestions = Array.isArray(response?.data?.suggestions)
        ? response.data.suggestions
        : [];
      if (!reply) {
        throw new Error("Empty response");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply, suggestions },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setError("Không thể kết nối chatbot. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Trợ lý mua sắm
              </div>
              <div className="text-xs text-gray-500">
                Hỏi về sản phẩm, size, giá, hoặc gợi ý
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Đóng chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-80 overflow-y-auto px-4 py-3" ref={scrollRef}>
            {!isAuthenticated && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                Vui lòng đăng nhập để sử dụng chatbot.
              </div>
            )}

            {isLoadingHistory && (
              <div className="text-xs text-gray-500">Đang tải lịch sử...</div>
            )}

            {messages.length === 0 && isAuthenticated && !isLoadingHistory && (
              <div className="text-sm text-gray-500">
                Bạn muốn tìm sản phẩm gì hôm nay?
              </div>
            )}

            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.text}
                    {msg.role === "assistant" &&
                      Array.isArray(msg.suggestions) &&
                      msg.suggestions.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {msg.suggestions.map((item) => (
                            <button
                              type="button"
                              key={item.productId}
                              onClick={() => navigate(`/product/${item.productId}`)}
                              className="overflow-hidden rounded-lg border border-gray-200 bg-white text-left text-[11px] text-gray-700 transition hover:shadow"
                              title={item.name}
                            >
                              <div className="h-16 w-full bg-gray-100">
                                {item.thumbnailUrl ? (
                                  <img
                                    src={item.thumbnailUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="px-2 py-1">
                                <div
                                  className="truncate font-medium text-gray-900"
                                  title={item.name}
                                >
                                  {item.name}
                                </div>
                                {typeof item.price === "number" && (
                                  <div className="text-gray-500">
                                    {item.price.toLocaleString("vi-VN")}₫
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 px-3 py-3">
            {error && <div className="mb-2 text-xs text-red-500">{error}</div>}
            <div className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Nhập câu hỏi..."
                className="min-h-[40px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                disabled={!isAuthenticated || isSending}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!isAuthenticated || isSending || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                aria-label="Gửi"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:scale-105"
        aria-label="Mở chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ChatbotWidget;
