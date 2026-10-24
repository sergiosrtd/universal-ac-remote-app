import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';

export interface IconName {
  sf: SFSymbol;
  md: AndroidSymbol;
}

export interface IconProps {
  name: IconName;
  size?: number;
  color: string;
}

/** SF Symbols on iOS, Material Symbols on Android and web. */
export function Icon({ name, size = 24, color }: IconProps) {
  return <SymbolView name={{ ios: name.sf, android: name.md, web: name.md }} size={size} tintColor={color} />;
}
