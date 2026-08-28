export default function Materials({materials}){
    return (
        <ol type="1">
            { materials.map((material, index) => (
                <li key={index}>
                    {material}
                </li>
            ))}
        </ol>
    );
}