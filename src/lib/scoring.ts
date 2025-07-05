export interface ScoringRule {
  id: number;
  name: string;
  value: string;
}

export const scoringData: ScoringRule[] = [
    { id: 1, name: "parti (színjáték)", value: "1" },
    { id: 2, name: "piros parti (piros színjáték)", value: "2" },
    { id: 3, name: "40 -100", value: "4" },
    { id: 4, name: "négy ász + parti", value: "4+1" },
    { id: 5, name: "ultimó (ulti) + parti", value: "4+1" },
    { id: 6, name: "betli", value: "5" },
    { id: 7, name: "durchmars", value: "6" },
    { id: 8, name: "piros 40-100", value: "8" },
    { id: 9, name: "20 -100", value: "8" },
    { id: 10, name: "piros négy ász + piros parti", value: "8+2" },
    { id: 11, name: "piros ultimó ( piros ulti)+ piros parti", value: "8+2" },
    { id: 12, name: "piros betli", value: "10" },
    { id: 13, name: "piros durchmars vagy redurchmars", value: "12" },
    { id: 14, name: "piros 20-100", value: "16" },
    { id: 15, name: "terített betli", value: "20" },
    { id: 16, name: "terített durchmars", value: "24" },
];

export const parseScoreValue = (value: string): number => {
    if (value.includes('+')) {
        return value.split('+').reduce((sum, part) => sum + parseInt(part, 10), 0);
    }
    return parseInt(value, 10);
};
