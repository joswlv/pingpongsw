var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

var COLLUSION_TYPE = { NO_COLLUSION: -1, VERTICAL: 1, HORIZONTAL: 2};

function Ball(player0Id, player1Id){
    BaseObejct.call(this);
    this.playerIds = [player0Id,player1Id];
    this.dynamic ={};
    this.speed = 4;
    this.dynamic = angleToVelocity(20);
    this.move = true;
    this.status.shape = "rectangle";
    this.status.rect = {
        x : SETTINGS.WIDTH/2,
        y : SETTINGS.HEIGHT/2,
        width : SETTINGS.BALL.WIDTH,
        height : SETTINGS.BALL.HEIGHT,
        color : {fill:"#000000"},
    };
}
Ball.prototype = new BaseObejct();
Ball.prototype.constructor = Ball;
Ball.prototype.update = function(room){
    if(this.move&&room.status=="playing"){
        var ball = this.status.rect;
        ball.x += this.dynamic.xVel*this.speed;
        ball.y += this.dynamic.yVel*this.speed;

        if(ball.x <= 0 - ball.width*2){
            room.objects[this.playerIds[1]].score++;
            this.dynamic = bounce(90,this.dynamic.angle);
            this.initialize();
        }
        if(ball.x >= SETTINGS.WIDTH + ball.width*2){
            room.objects[this.playerIds[0]].score++;
            this.dynamic = bounce(90,this.dynamic.angle);
            this.initialize();
        }
        if(ball.y - ball.height/2 <= 0 + SETTINGS.BORDER_WIDTH){
            this.dynamic = bounce(0,this.dynamic.angle);
        }

        if(ball.y + ball.height/2 >= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH){
            this.dynamic = bounce(0,this.dynamic.angle);
        }


        for(var object in room.objects){
            if(room.objects[object].role == "player"){
                var playerStat = room.objects[object].status.rect;
                var collusionType = ballCollusionCheck(ball, playerStat, this.dynamic.xVel*this.speed);
                switch(collusionType){
                    case COLLUSION_TYPE.NO_COLLUSION:
                        break;
                    case COLLUSION_TYPE.VERTICAL:
                        this.dynamic = bounce(0,this.dynamic.angle);
                        break;
                    case COLLUSION_TYPE.HORIZONTAL:
                        this.dynamic = bounce(90,this.dynamic.angle);
                        break;
                }
            }
        }
    }
};

Ball.prototype.initialize = function(objects){
    var ball = this.status.rect;
    ball.x = SETTINGS.WIDTH/2;
    ball.y = SETTINGS.HEIGHT/2;
};

module.exports = Ball;

function bounce(serfaceAngle,angle){
    var newAngle = (serfaceAngle*2-angle)%360;
    return angleToVelocity(newAngle);
}

function angleToVelocity(angle){
    return {
        angle : angle,
        xVel : Math.cos(angle/180*Math.PI),
        yVel : -Math.sin(angle/180*Math.PI)
    };
}

function ballCollusionCheck(ballStat,playerStat,xVel){
    if(pointSquareCollusionCheck(      ballStat.x - ballStat.width/2     , ballStat.y - ballStat.height/2, playerStat)){
        return pointSquareCollusionCheck(ballStat.x - ballStat.width/2 - xVel, ballStat.y - ballStat.height/2, playerStat)?
            COLLUSION_TYPE.VERTICAL:
            COLLUSION_TYPE.HORIZONTAL;
    }
    if(pointSquareCollusionCheck(      ballStat.x + ballStat.width/2     , ballStat.y - ballStat.height/2, playerStat)){
        return pointSquareCollusionCheck(ballStat.x + ballStat.width/2 - xVel, ballStat.y - ballStat.height/2, playerStat)?
            COLLUSION_TYPE.VERTICAL:
            COLLUSION_TYPE.HORIZONTAL;
    }
    if(pointSquareCollusionCheck(      ballStat.x - ballStat.width/2     , ballStat.y + ballStat.height/2, playerStat)){
        return pointSquareCollusionCheck(ballStat.x - ballStat.width/2 - xVel, ballStat.y + ballStat.height/2, playerStat)?
            COLLUSION_TYPE.VERTICAL:
            COLLUSION_TYPE.HORIZONTAL;
    }
    if(pointSquareCollusionCheck(      ballStat.x + ballStat.width/2     , ballStat.y + ballStat.height/2, playerStat)){
        return pointSquareCollusionCheck(ballStat.x + ballStat.width/2 - xVel, ballStat.y + ballStat.height/2, playerStat)?
            COLLUSION_TYPE.VERTICAL:
            COLLUSION_TYPE.HORIZONTAL;
    }
    return COLLUSION_TYPE.NO_COLLUSION;
}

function pointSquareCollusionCheck(x,y,square){
    if(x >= square.x-square.width/2 && x <= square.x+square.width/2 && y >= square.y-square.height/2 && y <= square.y+square.height/2 )
        return true;
}