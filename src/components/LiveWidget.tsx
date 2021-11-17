import {Grid, Divider, Typography, Box, Button} from '@mui/material'
import {Favorite, AccountCircle, People, Timer} from '@mui/icons-material'
import {LiveData} from 'src/types/live'

interface Props {
    liveData: LiveData;
    min: string;
    sec: string;
}

export default function LiveWidget(props: Props) {
    const {liveData, min, sec} = props
    const clientRole = sessionStorage.getItem('clientRole')

    return (
        <>
            <Grid alignItems="center" container>
                <Grid xs={1} item>
                    <AccountCircle />
                </Grid>
                <Grid xs={8} item>
                    <Typography variant="subtitle1">
                        {liveData.name || ""}
                    </Typography>
                </Grid>
                <Grid textAlign="end" xs={2} item>
                    10
                </Grid>
                <Grid textAlign="end" xs={1} item>
                    <Favorite />
                </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1">
                {liveData.title}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {
                liveData.description ?
                    <>
                        <Typography variant="subtitle2">
                            {liveData.description}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                    </> :
                    null
            }

            <Grid mb={10} alignItems="center" container>
                <Grid xs={1} item>
                    <People />
                </Grid>
                <Grid xs={7} item>
                    65
                </Grid>
                <Grid textAlign="end" xs={1} item>
                    <Timer />
                </Grid>
                <Grid textAlign="end" xs={2} item>
                    {`${min}:${sec}`}
                </Grid>
            </Grid>            
        </>
    )
}