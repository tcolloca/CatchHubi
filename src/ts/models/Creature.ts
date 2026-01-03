import { Entity } from './Entity';

export interface Creature extends Entity {
    type: string;
    color: string;
}
