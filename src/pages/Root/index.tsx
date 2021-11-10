import Login from 'src/pages/Root/Login'
import Home from 'src/pages/Root/Home'
import React from 'react'

interface Props {
    saveInfo: (uid: string, name: string, token: string) => void
    uid: string;
}

export default function Root(props: Props) {
    if (!props.uid) {
        return (
            <Login saveInfo={props.saveInfo} />
        )
    }
    else {
        return (
            <Home />
        )
    }
}