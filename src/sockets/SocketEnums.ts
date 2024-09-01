export enum SocketListener {
  Register_Player = "register_player",
  Monster_Select = "monster_selected",
  Monster_Select_Countdown = "select_monster_countdown_start",
  Attempt_Matchmaking = "attempt_matchmaking",
}

export enum SocketEmitter {
  Match_Found = "match_found",
  Start_Battle = "start_battle",
  Monster_Select_Countdown_Update = "countdown_update",
}
