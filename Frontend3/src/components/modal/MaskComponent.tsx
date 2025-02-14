import Mask1 from '@/assets/images/catMask_1.png';
import Mask2 from '@/assets/images/catMask_2.png';
import Mask3 from '@/assets/images/catMask_3.png';
import Mask4 from '@/assets/images/catMask_4.png';

interface MaskProps {
  x: number;
  y: number;
  width: number;
  height: number;
  // selectedMask: string | null;
}

// const maskImages: { [key: string]: string } = {
//   mask1: Mask1,
//   mask2: Mask2,
//   mask3: Mask3,
//   mask4: Mask4,
// };

function MaskComponent({ x, y, width, height }: MaskProps) {
  // const maskSrc = selectedMask ? maskImages[selectedMask] : Mask1; // 기본값 Mask1

  return (
    <img
      src={Mask1}
      alt="Mask"
      style={{
        position: "absolute",
        top: `${y}px`,
        left: `${x}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(-50%, -50%)`,
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}

export default MaskComponent;
