import {createContext} from 'react'
import {LiveDataList, LiveData} from 'src/types/live'
import _ from 'lodash'

interface LiveStreamInterface {
    liveDataList: LiveDataList;
    // currentChannel: string;
    // setCurrentChannel: (channelName: string) => void;
    refreshLiveData: (deleteChannels: Array<string>, updateChannels: Array<LiveData>) => void;
    updateLiveData: (data: LiveData) => void;
    addLiveData: (...data: Array<LiveData>) => void;
    deleteLiveData: (channelName: string) => void;
}

const LiveStreamingContext = createContext<LiveStreamInterface>({
    liveDataList: [],
    // currentChannel: "",
    // setCurrentChannel: (channelName) => {},
    refreshLiveData: (deleteChannels, updateChannels) => {},
    updateLiveData: (data) => {},
    addLiveData: (...data) => {},
    deleteLiveData: (channelName) => {}
})

LiveStreamingContext.displayName = "live-streaming"

export default LiveStreamingContext