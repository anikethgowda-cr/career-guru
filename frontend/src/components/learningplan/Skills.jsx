export default function Skills({ skills }) {
    return (
        <ol type="1">
            {skills.map((skill, index) => (
                <li key={index}>
                    {skill}
                </li>
            ))}
        </ol>
    );
}