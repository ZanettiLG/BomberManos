import { ExceptionTreatment } from "../../utils";
import Database from "../../database";
import { APIResponse, Session, SessionCookie } from "../../models";
import cookieService from "../cookies";

async function auth (token : string) : Promise<APIResponse<SessionCookie>>
{
    try 
    {
        if(!token || token == '')
        {  
            throw Error("301: Session doesn't exist");
        }

        //console.log(token)
        const session = await cookieService.decodify(token);
        const persistedSession = await Database.get("sessions", session.data.sessionId) as Session;
        if(session && persistedSession && persistedSession.user === session.data.userId)
        {
            return {
                data:session.data,
                messages:[]
            } as APIResponse<SessionCookie>
        }

        throw Error("401: Session doesn't exist");
    }
    catch (e)
    {
        throw new ExceptionTreatment(
            e as Error,
            500,
            "an error occurred while trying to authenticate"
        );
    }
}

export default auth;
