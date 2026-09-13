import React from "react";
import { View, Image, ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../constants/Colors";

// A arte dos avatares é normalizada num canvas 900x1200 (ver script de
// normalização dos assets): o personagem nunca ultrapassa 90% da largura
// (810px, centralizado) nem 90% da altura, e a cabeça sempre começa a ~4.5%
// do topo. resizeMode="cover" sempre centraliza o corte, então numa moldura
// quadrada ele cortava a cabeça (ou os braços/armas nas poses mais largas,
// como espadas erguidas) sempre que a arte não tinha exatamente essa
// proporção. 810px (a largura máxima garantida pelo script) nunca corta nada,
// mas sobra espaço em branco nas laterais pra poses com pouca "massa visual"
// nas pontas (ex.: lâminas finas). 720px foi validado nas poses mais largas
// do set (espadas erguidas, besta, machado+escudo) sem cortar mãos/armas.
const SRC_W = 900;
const SRC_H = 1200;
const CROP_LEFT = 90;
const CROP_SIZE = 720;

interface CharacterAvatarProps {
  source: ImageSourcePropType;
  size: number;
  style?: StyleProp<ViewStyle>;
}

export function CharacterAvatar({ source, size, style }: CharacterAvatarProps) {
  const zoom = size / CROP_SIZE;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          backgroundColor: Colors.surfaceDark,
        },
        style,
      ]}
    >
      <Image
        source={source}
        style={{
          position: "absolute",
          top: 0,
          left: -CROP_LEFT * zoom,
          width: SRC_W * zoom,
          height: SRC_H * zoom,
        }}
      />
    </View>
  );
}
