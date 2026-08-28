export default function Topics({ topics }) {
    return (
        <ol type="1">
            {topics.map((topic, index) => (
                <li key={index}>
                    {topic}
                </li>
            ))}
        </ol>
    );
}