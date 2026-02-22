declare module 'turkey-neighbourhoods' {
    export interface City {
        code: string;
        name: string;
    }

    export function getCities(): City[];
    export function getDistrictsByCityCode(code: string): string[];
}
