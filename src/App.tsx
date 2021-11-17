import React, {useState, useCallback, useEffect} from 'react';
import { Container } from '@mui/material'
import 'src/Firebase'
import LiveChannel from 'src/pages/LiveChannel'
import '@fontsource/roboto'
import {Route, Switch} from 'react-router-dom'
import LiveStreamingContext from 'src/context/LiveStreamingContext'
import {LiveData} from 'src/types/live'
import _ from 'lodash'
import Root from 'src/pages/Root'
import {getDatabase, onChildAdded, onChildRemoved, ref} from 'firebase/database'
import useLogin from './hooks/useLogin';
import {getAuth, onAuthStateChanged} from 'firebase/auth'

const database = getDatabase()
const auth = getAuth()

function App() {
    const [liveDataList, setLiveDataList] = useState<Array<LiveData>>([])
    const {uid, saveInfo} = useLogin()

    const addLiveData = (...data: Array<LiveData>) => {
        setLiveDataList(prev => [...prev, ...data])
    }

    const refreshLiveData = (deleteChannels: Array<string>, updateChannels: Array<LiveData>) => {
        setLiveDataList(prev => {
            const _liveDataList = liveDataList.filter(val => !deleteChannels.includes(val.channel))
            updateChannels.forEach(liveData => {
                const index = _liveDataList.findIndex(val => val.channel === liveData.channel)
                if(index !== -1) {
                    _liveDataList[index] = liveData
                }
            })
            return _liveDataList
        })
    }

    const updateLiveData = (data: LiveData) => {
        setLiveDataList(prev => {
            const {channel} = data
            const _liveDataList = _.cloneDeep(prev)
            const index = liveDataList.findIndex(val => val.channel === channel)
            if(index === -1) {
                return _liveDataList
            }
            _liveDataList[index] = data
            return _liveDataList
        })
    }

    const deleteLiveData = (channelName: string) => {
        setLiveDataList(prev => {
            return prev.filter(val => val.channel !== channelName)
        })
    }

    useEffect(() => {
        const unsubscribeAuthChange = onAuthStateChanged(auth, (user) => {
            if(user) {
                console.log(user.email, user.uid)
            }
            else {
                console.log('no user')
            }
        })

        return () => {
            unsubscribeAuthChange()
        }
    }, [])

    return (
        <LiveStreamingContext.Provider value={{ liveDataList, refreshLiveData, updateLiveData, addLiveData, deleteLiveData }}>
            <Container maxWidth="sm">
                <Switch>
                    <Route exact path="/">
                        <Root uid={uid} saveInfo={saveInfo} />
                    </Route>
                    <Route path="/live">
                        <LiveChannel />
                    </Route>
                </Switch>
            </Container>
        </LiveStreamingContext.Provider>
    )
}

export default App;
