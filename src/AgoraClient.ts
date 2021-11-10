import AgoraRTC from 'agora-rtc-sdk-ng'

export const agoraClient = AgoraRTC.createClient({
    mode: "live",
    codec: 'vp8'
})

export const appId = '80f2c660c69447c79b54fb12dde53ad6'