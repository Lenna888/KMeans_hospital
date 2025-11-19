import React from "react";

interface HospitalIconProps {
  cx?: number; // Coordenada X del centro
  cy?: number; // Coordenada Y del centro
  size?: number; // Tamaño del icono
  imagePath?: string;
}

const HospitalIcon: React.FC<HospitalIconProps> = ({
  cx = 0,
  cy = 0,
  size = 20,
  imagePath = "/hospital.png",
}) => {
  const halfSize = size / 2;

  return (
    <image
      x={cx - halfSize} // Posición X de inicio de la imagen (centrada en cx)
      y={cy - halfSize} // Posición Y de inicio de la imagen (centrada en cy)
      width={size}
      height={size}
      href={imagePath} //
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

export default HospitalIcon;
