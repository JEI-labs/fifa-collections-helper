export interface Sticker {
  id: string;
  code: string;
  number: number;
  full_code: string;
  scanned_at: string;
  is_duplicate: boolean;
}

export interface ScanResult {
  code: string;
  number: number;
  fullCode: string;
  isDuplicate: boolean;
}

export interface TeamInfo {
  code: string;
  name: string;
  flag: string;
}

export const TEAMS: Record<string, TeamInfo> = {
  BRA: { code: "BRA", name: "Brasil", flag: "🇧🇷" },
  ARG: { code: "ARG", name: "Argentina", flag: "🇦🇷" },
  FRA: { code: "FRA", name: "França", flag: "🇫🇷" },
  GER: { code: "GER", name: "Alemanha", flag: "🇩🇪" },
  ENG: { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  ESP: { code: "ESP", name: "Espanha", flag: "🇪🇸" },
  POR: { code: "POR", name: "Portugal", flag: "🇵🇹" },
  ITA: { code: "ITA", name: "Itália", flag: "🇮🇹" },
  NED: { code: "NED", name: "Holanda", flag: "🇳🇱" },
  BEL: { code: "BEL", name: "Bélgica", flag: "🇧🇪" },
  CRO: { code: "CRO", name: "Croácia", flag: "🇭🇷" },
  URU: { code: "URU", name: "Uruguai", flag: "🇺🇾" },
  COL: { code: "COL", name: "Colômbia", flag: "🇨🇴" },
  MEX: { code: "MEX", name: "México", flag: "🇲🇽" },
  USA: { code: "USA", name: "Estados Unidos", flag: "🇺🇸" },
  JPN: { code: "JPN", name: "Japão", flag: "🇯🇵" },
  KOR: { code: "KOR", name: "Coreia do Sul", flag: "🇰🇷" },
  AUS: { code: "AUS", name: "Austrália", flag: "🇦🇺" },
  MAR: { code: "MAR", name: "Marrocos", flag: "🇲🇦" },
  SEN: { code: "SEN", name: "Senegal", flag: "🇸🇳" },
  CMR: { code: "CMR", name: "Camarões", flag: "🇨🇲" },
  NGA: { code: "NGA", name: "Nigéria", flag: "🇳🇬" },
  EGY: { code: "EGY", name: "Egito", flag: "🇪🇬" },
  RSA: { code: "RSA", name: "África do Sul", flag: "🇿🇦" },
  POL: { code: "POL", name: "Polônia", flag: "🇵🇱" },
  SUI: { code: "SUI", name: "Suíça", flag: "🇨🇭" },
  AUT: { code: "AUT", name: "Áustria", flag: "🇦🇹" },
  CZE: { code: "CZE", name: "República Tcheca", flag: "🇨🇿" },
  DEN: { code: "DEN", name: "Dinamarca", flag: "🇩🇰" },
  SWE: { code: "SWE", name: "Suécia", flag: "🇸🇪" },
  NOR: { code: "NOR", name: "Noruega", flag: "🇳🇴" },
  RUS: { code: "RUS", name: "Rússia", flag: "🇷🇺" },
  UKR: { code: "UKR", name: "Ucrânia", flag: "🇺🇦" },
  TUR: { code: "TUR", name: "Turquia", flag: "🇹🇷" },
  GRE: { code: "GRE", name: "Grécia", flag: "🇬🇷" },
  ROU: { code: "ROU", name: "Romênia", flag: "🇷🇴" },
  HUN: { code: "HUN", name: "Hungria", flag: "🇭🇺" },
  IRL: { code: "IRL", name: "Irlanda", flag: "🇮🇪" },
  SCO: { code: "SCO", name: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  WAL: { code: "WAL", name: "País de Gales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  NIR: { code: "NIR", name: "Irlanda do Norte", flag: "🇳🇬" },
  SRB: { code: "SRB", name: "Sérvia", flag: "🇷🇸" },
  SVN: { code: "SVN", name: "Eslovênia", flag: "🇸🇮" },
  SVK: { code: "SVK", name: "Eslováquia", flag: "🇸🇰" },
  BIH: { code: "BIH", name: "Bósnia-Herzegovina", flag: "🇧🇦" },
  ALB: { code: "ALB", name: "Albânia", flag: "🇦🇱" },
  MKD: { code: "MKD", name: "Macedônia", flag: "🇲🇰" },
  ISL: { code: "ISL", name: "Islândia", flag: "🇮🇸" },
  FIN: { code: "FIN", name: "Finlândia", flag: "🇫🇮" },
  IRN: { code: "IRN", name: "Irã", flag: "🇮🇷" },
  KSA: { code: "KSA", name: "Arábia Saudita", flag: "🇸🇦" },
  QAT: { code: "QAT", name: "Catar", flag: "🇶🇦" },
  UAE: { code: "UAE", name: "Emirados Árabes", flag: "🇦🇪" },
  IRQ: { code: "IRQ", name: "Iraque", flag: "🇮🇶" },
  CHN: { code: "CHN", name: "China", flag: "🇨🇳" },
  IND: { code: "IND", name: "Índia", flag: "🇮🇳" },
  IDN: { code: "IDN", name: "Indonésia", flag: "🇮🇩" },
  THA: { code: "THA", name: "Tailândia", flag: "🇹🇭" },
  VIE: { code: "VIE", name: "Vietnã", flag: "🇻🇳" },
  MAS: { code: "MAS", name: "Malásia", flag: "🇲🇾" },
  SIN: { code: "SIN", name: "Singapura", flag: "🇸🇬" },
  PHI: { code: "PHI", name: "Filipinas", flag: "🇵🇭" },
  NZL: { code: "NZL", name: "Nova Zelândia", flag: "🇳🇿" },
  CAN: { code: "CAN", name: "Canadá", flag: "🇨🇦" },
  CRC: { code: "CRC", name: "Costa Rica", flag: "🇨🇷" },
  PAN: { code: "PAN", name: "Panamá", flag: "🇵🇦" },
  JAM: { code: "JAM", name: "Jamaica", flag: "🇯🇲" },
  HON: { code: "HON", name: "Honduras", flag: "🇭🇳" },
  GUA: { code: "GUA", name: "Guatemala", flag: "🇬🇹" },
  TRI: { code: "TRI", name: "Trinidad e Tobago", flag: "🇹🇹" },
  ECU: { code: "ECU", name: "Equador", flag: "🇪🇨" },
  PER: { code: "PER", name: "Peru", flag: "🇵🇪" },
  CHI: { code: "CHI", name: "Chile", flag: "🇨🇱" },
  BOL: { code: "BOL", name: "Bolívia", flag: "🇧🇴" },
  PAR: { code: "PAR", name: "Paraguai", flag: "🇵🇾" },
  VEN: { code: "VEN", name: "Venezuela", flag: "🇻🇪" },
};
