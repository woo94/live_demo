import {agoraClient} from 'src/AgoraClient'
import {useEffect, useRef, useState} from 'react'
import AgoraRTC, {IMicrophoneAudioTrack, ICameraVideoTrack} from 'agora-rtc-sdk-ng'
import AudienceRoom from './Audience'
import HostRoom from './Host'
import {getDatabase, ref} from 'firebase/database'

const database = getDatabase()

export default function LiveChannel() {
    const clientRole = sessionStorage.getItem('clientRole')

    if(clientRole === "host") {
        return (
            <HostRoom />
        )
    }
    else {
        return (
            <AudienceRoom />
        )
    }
}