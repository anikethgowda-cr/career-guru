export default function ChatInput({ value, onChange, onSubmit }) {
    return (
        <form className="chat-input-container" onSubmit={onSubmit}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type a message..."
            />
            <button type="submit">Send</button>
        </form>
    );
}
