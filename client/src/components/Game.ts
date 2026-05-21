import * as SocketIO from 'socket.io-client';
import { IMatchSetup, IUser, ServerToClientEvents, ClientToServerEvents, IGameProps } from '../models';
import { GameInputHandler } from '../libs/gameInputHander';

export class Game 
{
    private mapCanvas : HTMLCanvasElement;
    private mapContext : CanvasRenderingContext2D;
    private socket : SocketIO.Socket<ServerToClientEvents, ClientToServerEvents>;
    private data : any;
    private user : IUser;

    constructor (gamediv : HTMLDivElement, width : number, height : number, className : string, gameData : IGameProps)
    {
        this.mapCanvas = document.createElement('canvas');
        this.mapCanvas.width = width;
        this.mapCanvas.height = height;
        this.mapCanvas.className = className;
        gamediv.appendChild(this.mapCanvas);
		this.mapContext = this.mapCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.gameCicle = this.gameCicle.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.socket = gameData.socket;
        this.data = gameData.data;
        this.user = gameData.user;
        this.start ();
    }

    private tileRender (x : number, y : number, type : any)
    {
        this.mapContext.fillStyle = type.color;
        this.mapContext.fillRect(x*46, y*46, 46, 46);
    }

    private handleKeyDown (e : KeyboardEvent)
    {
        const map = this.data.map;
        const player = this.data.players[0];
        if (!player || !player.position) return;

        let tx = player.position.x;
        let ty = player.position.y;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                ty -= 1;
                break;
            case 'ArrowDown':
            case 's':
                ty += 1;
                break;
            case 'ArrowLeft':
            case 'a':
                tx -= 1;
                break;
            case 'ArrowRight':
            case 'd':
                tx += 1;
                break;
            default:
                return;
        }

        e.preventDefault();
        this.socket.emit('player-move' as any, { x: tx / map.width, y: ty / map.height });
    }

    private gameCicle ()
    {
        this.mapContext.clearRect(0, 0, this.mapContext.canvas.width, this.mapContext.canvas.height);

        const map = this.data.map;
        let n = 0;
        for (let y = 0; y < map.height; y++)
        {
            for (let x = 0; x < map.width; x++)
            {
                const tile = map.data[n++];
                if(!tile) continue;
                const type = map.types[tile.type];
                this.tileRender(x, y, type);
            }
        }

        this.data.players.forEach((player : any) => 
        {
            this.mapContext.fillStyle = player.owner == this.user.username?'green':'red';
            this.mapContext.fillRect(player.position.x*46, player.position.y*46, 46, 46);
        });

        requestAnimationFrame(this.gameCicle);
    }

    public start ()
    {
		this.socket.emit('player-started' as any);

		this.socket.on('game-ready' as any, () =>
		{
			console.log('Preparado!');

			this.socket.on('game-update' as any, (data: any)=>
			{
				console.log('update', data);
				this.data = data;
			});

			document.addEventListener('keydown', this.handleKeyDown);
			
			const input = new GameInputHandler(this.mapCanvas);
			
			requestAnimationFrame(this.gameCicle);
		});
    }

}