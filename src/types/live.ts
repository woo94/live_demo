export interface LiveData {
    description: string;
    grade: string;
    start_at: number;
    expire_at: number;
    title: string;
    total_time: number;
    name: string;
    host: string;
    channel: string;
    url: string;
    likes: number;
    viewers: number;
    active: boolean;
}

export type LiveDataList = Array<LiveData>

export type LiveMap = Map<string, LiveData>