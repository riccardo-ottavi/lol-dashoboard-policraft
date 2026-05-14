const itemUrl = (id: number) =>
    id ? `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${id}.png` : null;

interface Props {
    id: number;
}

export const ItemSlot = ({ id }: Props) => {
    const url = itemUrl(id);
    return (
        <div
            className="item-slot"
            style={{
                background: url ? 'transparent' : 'rgba(255,255,255,0.05)',
            }}>
            {url && <img src={url} className="item-sprite" alt=""/>}
        </div>
    );
};