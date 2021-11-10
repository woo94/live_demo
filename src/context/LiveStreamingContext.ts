import {createContext} from 'react'
import {LiveMap, LiveData} from 'src/types/live'
import _ from 'lodash'

interface LiveStreamInterface {
    liveMap: LiveMap;
    // currentChannel: string;
    // setCurrentChannel: (channelName: string) => void;
    upsertLiveData: (channelName: string, data: LiveData) => void;
    deleteLiveData: (channelName: string) => void;
}

const LiveStreamingContext = createContext<LiveStreamInterface>({
    liveMap: new Map(),
    // currentChannel: "",
    // setCurrentChannel: (channelName) => {},
    upsertLiveData: (channelName, data) => {},
    deleteLiveData: (channelName) => {}
})

LiveStreamingContext.displayName = "live-streaming"

export default LiveStreamingContext