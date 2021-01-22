import Level from "../Level";
import Piece from "../Piece";

export default interface IBaseGame {
    head: Piece;
    
    tail: Piece;

    /** @default null */
    food: Piece | null;
    
    /** @default null */
    goldenApple: Piece | null;

    /** @default 0 */
    length: number;

    /** @default 0 */
    growth: number;

    /** @default 0 */
    score: number;

    /** @default null */
    currentLevel: Level | null;

    garden: HTMLDivElement;
}