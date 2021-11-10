export interface LiveData {
    description: string;
    grade: string;
    // like: number;
    title: string;
    total_time: number;
    name: string;
    host: string;
}

export type LiveMap = Map<string, LiveData>