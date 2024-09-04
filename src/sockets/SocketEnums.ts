export enum SocketListener {
  Register_Player = "register_player",
  Start_Battle = "start_battle",
  Monster_Select_Countdown = "select_monster_countdown_start",
  Attempt_Matchmaking = "attempt_matchmaking",
  Get_Match_Data = "get_match_data",
}

export enum SocketEmitter {
  Match_Found = "match_found",
  Start_Battle = "start_battle",
  Monster_Select_Countdown_Update = "countdown_update",
  Match_Data = "match_data",
}
