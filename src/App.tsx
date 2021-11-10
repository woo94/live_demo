import React, {useState, useCallback, useEffect} from 'react';
import { Container } from '@mui/material'
import 'src/Firebase'
import LiveChannel from 'src/pages/LiveChannel'
import '@fontsource/roboto'
import {Route, Switch} from 'react-router-dom'
import LiveStreamingContext from 'src/context/LiveStreamingContext'
import {LiveMap, LiveData} from 'src/types/live'
import _ from 'lodash'
import Root from 'src/pages/Root'
import {getDatabase, onChildAdded, onChildRemoved, ref} from 'firebase/database'
import useLogin from './hooks/useLogin';

const database = getDatabase()

function App() {
    const [liveMap, setLiveMap] = useState<LiveMap>(new Map())
    const {uid, saveInfo} = useLogin()

    const upsertLiveData = useCallback((channelName: string, data: LiveData) => {
        setLiveMap(prev => {
            const _liveMap = _.cloneDeep(prev)
            _liveMap.set(channelName, data)
            return _liveMap
        })
    }, [setLiveMap])

    const deleteLiveData = useCallback((channelName: string) => {
        setLiveMap(prev => {
            const _liveMap = _.cloneDeep(prev)
            _liveMap.delete(channelName)
            return _liveMap
        })
    }, [setLiveMap])

    useEffect(() => {
        console.log(uid, 'useEffect hook')
        if(uid === null) {
            return
        }
        
        const liveRef = ref(database, 'live')
        // add listener to list
        const offOnChildAdded = onChildAdded(liveRef, (snapshot) => {
            const channelName = snapshot.key as string
            const data = snapshot.val()
            const liveData: LiveData = {
                description: data['description'],
                grade: data['grade'],
                title: data['title'],
                total_time: data['total_time'],
                name: data['name'],
                host: data['host']
            }
            upsertLiveData(channelName, liveData)
        })
        const offOnChildRemoved = onChildRemoved(liveRef, (snapshot) => {
            const channelName = snapshot.key as string
            deleteLiveData(channelName)
        })

        return () => {
            offOnChildAdded()
            offOnChildRemoved()
        }
        
    }, [uid])

    return (
        <LiveStreamingContext.Provider value={{ liveMap, upsertLiveData, deleteLiveData }}>
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
