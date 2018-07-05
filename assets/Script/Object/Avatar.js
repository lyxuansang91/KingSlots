
cc.Class({
    extends: cc.Component,

    properties: {
        progressBar : cc.ProgressBar,
        bar : cc.Node,
        colors : [cc.Color],
        light_round : cc.ParticleSystem,
        light_follow : cc.ParticleSystem,
        cards : cc.Node,
        bet_money : cc.Node,
        username: cc.Label,
        user_money: cc.Label,
        bet_status: cc.Node,
        playerId: 0,
        avatar : cc.Node,
        lbl_bet_money: cc.Label,
        bet_status_frame: [cc.SpriteFrame],
        ic_exit_room: cc.Node
    },

    onLoad : function () {
        this.cardCover = [];
        this.deltaTime = 0;
        this.duration = 0;
        this.isProgressing = false;
        this.light_follow.stopSystem();
    },

    init: function (duration) {
        // this.duration = duration;
        // this.deltaTime = 0;
        // this.progressBar.progress = 0;
        // this.isProgressing = true;
        // this.checkColorProcess();
        // this.light_follow.resetSystem();

        this.isProgressing = false;
        this.duration = 0;
        this.progressBar.progress = 0;
        this.light_follow.stopSystem();
    },

    setParticlePosition: function (index) {
        var r = this.node.width/2;
        var angel = (90 - index*360)*Math.PI/180;
        var x = r*Math.cos(angel);
        var y = r*Math.sin(angel);

        this.light_follow.node.setPosition(cc.p(x,y));
    },

    stop: function () {
        this.isProgressing = false;
        this.duration = 0;
        this.progressBar.progress = 0;
        this.light_follow.stopSystem();
    },

    updateProgressCircleBar: function(duration){
        this.duration = parseInt(duration/1000);
        this.deltaTime = 0;
        this.progressBar.progress = 0;
        this.isProgressing = true;
        this.checkColorProcess();
        this.light_follow.resetSystem();
    },

    resetProcessCircleBar: function(){
        this.isProgressing = false;
        this.duration = 0;
        this.progressBar.progress = 0;
        this.light_follow.stopSystem();
    },

    update: function (dt) {
        if(this.isProgressing){
            this.deltaTime += dt;
            this.progressBar.progress = this.deltaTime/this.duration;
            this.setParticlePosition(this.progressBar.progress);

            if (this.deltaTime > this.duration) {
                this.deltaTime = 0;
                //this.isProgressing = false;
                this.progressBar.progress = 0;
            }
        }
    },

    checkColorProcess: function () {
        if(this.colors.length < 3){
            return;
        }
        this.bar.stopAllActions();
        this.bar.color = this.colors[0];

        var action1 = cc.tintTo(this.duration/2,
            this.colors[1].r,this.colors[1].g,this.colors[1].b);

        var action2 = cc.tintTo(this.duration/4,
            this.colors[2].r,this.colors[1].g,this.colors[2].b);

        this.bar.runAction(cc.sequence(action1,action2));
    },

    cardPosition: function () {

    },

    avatarPosition: function (index,capacity,size_table) {

        var point = cc.p(0,0);
        if(capacity == 5){
            if(index == 0){

                this.cards.active = false;
                this.bet_money.active = false;

                point = cc.p(-0.05,-0.5);

            }else if(index == 1){

                this.setCardCoverPosition(cc.p(-this.node.width*0.825,-this.node.height*0.2));
                this.bet_money.setPosition(cc.p(-this.node.width*0.825,this.node.height*0.2));

                point = cc.p(0.45,-0.25);

            }else if(index == 2){

                this.setCardCoverPosition(cc.p(-this.node.width*0.65,-this.node.height*0.8));
                this.bet_money.setPosition(cc.p(-this.node.width*0.65,-this.node.height*1.125));

                point = cc.p(0.3,0.55);

            }else if(index == 3){

                this.setCardCoverPosition(cc.p(this.node.width*0.65,-this.node.height*0.8));
                this.bet_money.setPosition(cc.p(this.node.width*0.65,-this.node.height*1.125));

                point = cc.p(-0.3,0.55);

            }else if(index == 4){

                this.setCardCoverPosition(cc.p(this.node.width*0.825,-this.node.height*0.2));
                this.bet_money.setPosition(cc.p(this.node.width*0.85,this.node.height*0.2));

                point = cc.p(-0.45,-0.25);
            }
        }else if(capacity == 9){
            if(index == 0){

                this.cards.active = false;
                this.bet_money.active = false;

                point = cc.p(-0.075,-0.5);

            }else if(index == 1){

                this.setCardCoverPosition(cc.p(-this.node.width*0.525,this.node.height*0.6));
                this.bet_money.setPosition(cc.p(-this.node.width*0.525,this.node.height*0.95));

                point = cc.p(0.35,-0.5);
            }else if(index == 2){

                this.setCardCoverPosition(cc.p(-this.node.width*0.825,-this.node.height*0.1));
                this.bet_money.setPosition(cc.p(-this.node.width*0.825,this.node.height*0.25));

                point = cc.p(0.5,-0.15);
            }else if(index == 3){

                this.setCardCoverPosition(cc.p(-this.node.width*0.755,-this.node.height*0.8));
                this.bet_money.setPosition(cc.p(-this.node.width*0.755,-this.node.height*0.45));

                point = cc.p(0.45,0.35);
            }else if(index == 4){

                this.setCardCoverPosition(cc.p(0,-this.node.height*1.35));
                this.bet_money.setPosition(cc.p(0,-this.node.height*1.0));

                point = cc.p(0.25,0.565);
            }else if(index == 5){

                this.setCardCoverPosition(cc.p(0,-this.node.height*1.35));
                this.bet_money.setPosition(cc.p(0,-this.node.height*1.0));

                point = cc.p(-0.25,0.565);
            }else if(index == 6){

                this.setCardCoverPosition(cc.p(this.node.width*0.755,-this.node.height*0.8));
                this.bet_money.setPosition(cc.p(this.node.width*0.755,-this.node.height*0.45));

                point = cc.p(-0.45,0.35);
            }else if(index == 7){

                this.setCardCoverPosition(cc.p(this.node.width*0.825,-this.node.height*0.1));
                this.bet_money.setPosition(cc.p(this.node.width*0.825,this.node.height*0.25));

                point = cc.p(-0.5,-0.15);
            }else if(index == 8){

                this.setCardCoverPosition(cc.p(this.node.width*0.525,this.node.height*0.6));
                this.bet_money.setPosition(cc.p(this.node.width*0.525,this.node.height*0.95));

                point = cc.p(-0.35,-0.5);
            }
        }

        if(capacity == 5){
            if(index != 0){
                this.node.scale = 0.7;
            }
        }else if(capacity == 9){
            if(index != 0){
                this.node.scale = 0.65;
            }
        }

        return cc.p(point.x * size_table.width,point.y * size_table.height);
    },
    
    setCardCoverPosition(card_pos){
        this.card_pos = card_pos;
    },
    
    getCardCoverPosition(){
        return this.card_pos;  
    },

    avatarInfomation(username, userMoney) {
        this.username.string = username;
        this.user_money.string = userMoney;
    },

    loadAvatar(image_index, position_index, id, _name,  _money, roomIndex, player) {
        this.posIndex = position_index;
        this.player = player;
        this.roomIndex = roomIndex;

        if (image_index > 100021){
            image_index = 100000;
        }

        this.playerId = id;
        this.username.string = _name;
        this.user_money.string = _money;

        //show trang thai nguoi choi, hay nguoi cho
        cc.log("------------------------isPlayer ", player);
        this.showPlayer(player);
    },

    addCardCover(card_cover){
        this.cardCover.push(card_cover);
    },

    showPlayer(player){
        if (player){
            this.avatar.setOpacity(255);
        }
        else {
            this.avatar.setOpacity(100);
        }
    },

    getPlayerId(){
        return this.playerId;
    },

    isPlayer(){
        return this.player;
    },

    getPositionIndex(){
        return this.posIndex;
    },

    showBetMoney(){
        this.bet_money.active = true;
    },

    setBetMoney(betMoney) {
        // var is_visible_bet_money = bg_bet_money->isVisible();
        this.value_bet_money = betMoney;
        // bet_money->setString(Common::getInstance()->convertLongToMoneyViewK((int)betMoney));
        // bet_money->setVisible(betMoney != 0);
        // bg_bet_money->setVisible(betMoney != 0);
        //
        // if (!is_visible_bet_money && betMoney != 0){
        //     bg_bet_money->setScale(0.1f);
        //
        //     bg_bet_money->runAction(ScaleTo::create(0.4f, 1));
        // }
        if(betMoney !== 0){
            this.lbl_bet_money.string = Common.numberFormatWithCommas(betMoney);
        }
    },

    getBetMoney(){
        return this.value_bet_money;
    },

    setMoney(_money){
        this.lbl_bet_money.string = Common.numberFormatWithCommas(_money);
    },

    setWin(duration){
        // auto node = Node::create();
        //
        // MSprite* sp_light = MSprite::create(BANCHOI_COMMON_LIGHT);
        //
        // MSprite* sp_light_round = MSprite::create(BANCHOI_COMMON_LIGHT_ROUND);
        //
        // sp_light->setAnchorPoint(Point::ANCHOR_MIDDLE);
        // sp_light_round->setAnchorPoint(Point::ANCHOR_MIDDLE);
        // sp_light_round->setScale(0.2f);
        //
        // node->setContentSize(sp_light->getContentSize());
        //
        // sp_light->setScale(0.2f);
        //
        // sp_light->setPosition(Vec2(node->getContentSize().width * 0.5f, node->getContentSize().height * 0.5f));
        // sp_light_round->setPosition(sp_light->getPosition());
        //
        // node->addChild(sp_light_round);
        // node->addChild(sp_light);
        //
        // MSprite* bkg_win = MSprite::create(BAN_CHOI_COMMON_THANG);
        // bkg_win->setAnchorPoint(Point::ANCHOR_MIDDLE_BOTTOM);
        // bkg_win->setPosition(Vec2(sp_light->getPositionX(), sp_light->getPositionY() - 0.8f * bkg_win->getHeight()));
        // node->addChild(bkg_win);
        //
        // SoundManager::getInstance()->playSound(soundOther[10]);
        // this->addChild(node);
        //
        // auto ac1 = Sequence::create(ScaleTo::create(1.2f, 1.22f), FadeOut::create(0.2f), NULL);
        // auto ac2 = Sequence::create(ScaleTo::create(0, 0.25), FadeIn::create(0), NULL);
        // sp_light_round->runAction(RepeatForever::create(Sequence::create(ac2, ac1, ac2->clone(),
        //     ac1->clone(), NULL)));
        //
        // sp_light->runAction(Spawn::create(ScaleTo::create(1.0f, 1.0f), Sequence::create(RotateBy::create(duration, 100), FadeOut::create(0.8f), NULL), NULL));
        // bkg_win->runAction(Sequence::create(DelayTime::create(duration), FadeOut::create(0.8f), NULL));
        //
        // Vec2 center_pos = Vec2(node->getContentSize().width * 0.5f, node->getContentSize().height * 0.5f);
        // node->setPosition(avatar->getPosition() - center_pos);
        //
        // /*for (int i = 0; i < 15; i++){
        //     MSprite* sp_star = MSprite::create(BANCHOI_COMMON_STAR);
        //     sp_star->setAnchorPoint(Point::ANCHOR_MIDDLE);
        //     sp_star->setPosition(center_pos + Vec2(
        //         random(-avatar->getContentSize().width * avatar->getScale() * 0.505f, avatar->getContentSize().width * avatar->getScale() * 0.505f),
        //         random(-avatar->getContentSize().height * avatar->getScale() * 0.5f, avatar->getContentSize().height * avatar->getScale() * 0.508f)
        //         ));
        //     node->addChild(sp_star);
        //
        //     sp_star->runAction(RepeatForever::create(Sequence::create(Spawn::create(ScaleTo::create(0.6f + 0.2*i, 0.2f), RotateBy::create(1.0f + 0.2*i, 200), NULL),
        //         Spawn::create(ScaleTo::create(0.5f, 1.0f), RotateBy::create(0.5f, 150), NULL), NULL)));
        // }*/
        //
        // auto sparkle = Common::getInstance()->getParticleSystemQuadFromPath(ANIMATION_WIN_SPARKLE);
        // if (sparkle != NULL) {
        //     node->addChild(sparkle);
        //     sparkle->setScale(0.4f);
        //     sparkle->setPosition(center_pos);
        // }
        //
        // node->runAction(Sequence::create(DelayTime::create(duration + 0.8f),
        // RemoveSelf::create(), NULL));
    },

    setLose(duration){
        // auto node = Node::create();
        //
        // auto spriteBlur = MSprite::create(BG_AVATAR);
        // spriteBlur->setColor(Color3B::BLACK);
        // spriteBlur->setOpacity(180);
        // spriteBlur->setScale(under_ava->getWidth() * under_ava->getScale() / spriteBlur->getWidth());
        //
        // node->addChild(spriteBlur);
        //
        // node->setContentSize(Size(spriteBlur->getWidth(), spriteBlur->getHeight()) * spriteBlur->getScale());
        //
        // Vec2 pointCenterNode = Vec2(spriteBlur->getWidth() * spriteBlur->getScale() * 0.5f,
        //     spriteBlur->getHeight() * spriteBlur->getScale() * 0.5f);
        //
        // node->setPosition(avatar->getPosition() - pointCenterNode);
        //
        // MSprite* bkg_lose = MSprite::create(BAN_CHOI_COMMON_THUA);
        // bkg_lose->setAnchorPoint(Point::ANCHOR_MIDDLE_BOTTOM);
        // bkg_lose->setPosition(Vec2(spriteBlur->getWidth() * spriteBlur->getScale() / 2,
        //     node->getContentSize().height * 0.5f - 0.8f * bkg_lose->getHeight()));
        // node->addChild(bkg_lose);
        //
        // /*MLabel* lb_thua = MLabel::create(getLanguageStringWithKey("TXT_LOSE").c_str(), avatar->getHeight() / 3.0f, Color3B::RED, true);
        // lb_thua->setAnchorPoint(Point::ANCHOR_MIDDLE);
        // lb_thua->setPosition(Vec2(pointCenterNode.x, spriteBlur->getHeight() * spriteBlur->getScale() * 0.4f));
        // node->addChild(lb_thua);*/
        //
        // node->runAction(Sequence::create(
        //     DelayTime::create(duration - 0.5f),
        // RemoveSelf::create(), NULL));
        // this->addChild(node);
    },

    flipCards(flip_up_cards) {
        // if (!flip_up_cards.empty()){
        //     cardValue = flip_up_cards;
        //
        //     auto camera1 = OrbitCamera::create(0.25f, 1, 0, 0.0f, 90.0f, 0, 0);
        //     auto camera2 = OrbitCamera::create(0.25f, 1, 0, 270.0f, 90.0f, 0, 0);
        //
        //     for (int i = 0; i < cardCover.size(); i++) {
        //         if (cardCover[i] != NULL && cardCover[i]->getParent() != NULL) {
        //             auto callbackJump = CallFunc::create([=]() {
        //                 Card flipUpCard;
        //                 flipUpCard.setValue(flip_up_cards[i]);
        //                 cardCover[i]->setSpriteFrame(flipUpCard.getMauBinhName());
        //             });
        //             auto sequence = Sequence::create(camera1->clone(), callbackJump, camera2->clone(), NULL);
        //             cardCover[i]->runAction(sequence);
        //         }
        //     }
        // }
    },

    setPlayStatus(turnType){
        this.turn_type = turnType;

        this.showStatusBet(turnType);
    },

    showStatusBet(statusBet){
        cc.log("status bet =", statusBet);
        this.bet_status.getComponent(cc.Sprite).spriteFrame = this.bet_status_frame[statusBet-1];
    },

    showRegisterExitRoom(isShow){
        this.ic_exit_room.active = isShow;
    },

    getTurnType(){
        return this.turn_type;
    },

    addAllHiddenCard(){
        // for (MSprite* it : cardCover){
        //     addHiddenCard(it);
        // }
    },

    setAllIn(all_in){
        this.all_in = all_in;
    },

    isAllIn(){
        return this.all_in;
    },


});
