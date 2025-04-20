# ascii_pong.py - Jogo Pong em ASCII com menu, modo solo e som (opcional)
import curses
import time
import random
import platform
import os

# Configurações
PADDLE_HEIGHT = 4
PADDLE_CHAR = '|'
BALL_CHAR = 'O'
WIN_SCORE = 5
DELAY = 0.04

# Detecta sistema operacional
IS_WINDOWS = platform.system() == "Windows"

def play_sound():
    if IS_WINDOWS:
        import winsound
        winsound.Beep(1000, 100)
    else:
        os.system('play -nq -t alsa synth 0.1 sine 1000 >/dev/null 2>&1')

def draw_paddle(win, x, y):
    for i in range(PADDLE_HEIGHT):
        if 0 < y + i < win.getmaxyx()[0] - 1:
            win.addch(y + i, x, PADDLE_CHAR)

def draw_ball(win, x, y):
    if 0 < y < win.getmaxyx()[0] - 1 and 0 < x < win.getmaxyx()[1] - 1:
        win.addch(y, x, BALL_CHAR)

def center_text(win, y, text):
    _, width = win.getmaxyx()
    x = max((width // 2 - len(text) // 2), 1)
    win.addstr(y, x, text)

def show_menu(stdscr):
    stdscr.clear()
    center_text(stdscr, 5, "=== ASCII PONG ===")
    center_text(stdscr, 7, "1 - Um Jogador (vs Bot)")
    center_text(stdscr, 8, "2 - Dois Jogadores")
    center_text(stdscr, 10, "Q - Sair")
    stdscr.refresh()
    while True:
        key = stdscr.getch()
        if key == ord('1'):
            return "solo"
        elif key == ord('2'):
            return "duo"
        elif key == ord('q'):
            return "sair"

def countdown(win):
    for i in range(3, 0, -1):
        win.clear()
        win.border()
        center_text(win, win.getmaxyx()[0]//2, f"Recomeçando em {i}...")
        win.refresh()
        time.sleep(0.7)

def main(stdscr):
    curses.curs_set(0)
    stdscr.nodelay(True)
    stdscr.timeout(0)
    height, width = stdscr.getmaxyx()

    modo = show_menu(stdscr)
    if modo == "sair":
        return

    paddle1_y = paddle2_y = height // 2 - PADDLE_HEIGHT // 2
    paddle1_x = 2
    paddle2_x = width - 3

    ball_x = width // 2
    ball_y = height // 2
    direction_x = random.choice([-1, 1])
    direction_y = random.choice([-1, 1])

    score1 = score2 = 0

    while True:
        stdscr.clear()
        stdscr.border()

        center_text(stdscr, 1, f"{score1} : {score2}")

        draw_paddle(stdscr, paddle1_x, paddle1_y)
        draw_paddle(stdscr, paddle2_x, paddle2_y)
        draw_ball(stdscr, ball_x, ball_y)

        stdscr.refresh()

        key = stdscr.getch()
        if key == ord('q'):
            break
        elif key == ord('w') and paddle1_y > 1:
            paddle1_y -= 1
        elif key == ord('s') and paddle1_y + PADDLE_HEIGHT < height - 1:
            paddle1_y += 1
        elif modo == "duo":
            if key == curses.KEY_UP and paddle2_y > 1:
                paddle2_y -= 1
            elif key == curses.KEY_DOWN and paddle2_y + PADDLE_HEIGHT < height - 1:
                paddle2_y += 1
        elif modo == "solo":
            if ball_y < paddle2_y and paddle2_y > 1:
                paddle2_y -= 1
            elif ball_y > paddle2_y + PADDLE_HEIGHT - 1 and paddle2_y + PADDLE_HEIGHT < height - 1:
                paddle2_y += 1

        ball_x += direction_x
        ball_y += direction_y

        if ball_y <= 1 or ball_y >= height - 2:
            direction_y *= -1
            play_sound()

        if (ball_x == paddle1_x + 1 and paddle1_y <= ball_y < paddle1_y + PADDLE_HEIGHT) or            (ball_x == paddle2_x - 1 and paddle2_y <= ball_y < paddle2_y + PADDLE_HEIGHT):
            direction_x *= -1
            play_sound()

        if ball_x <= 0:
            score2 += 1
            play_sound()
            ball_x, ball_y = width // 2, height // 2
            direction_x = 1
            countdown(stdscr)

        elif ball_x >= width - 1:
            score1 += 1
            play_sound()
            ball_x, ball_y = width // 2, height // 2
            direction_x = -1
            countdown(stdscr)

        if score1 == WIN_SCORE or score2 == WIN_SCORE:
            stdscr.clear()
            stdscr.border()
            winner = "Jogador 1" if score1 > score2 else "Jogador 2"
            center_text(stdscr, height // 2, f"{winner} venceu! Pressione 'q' para sair.")
            stdscr.refresh()
            while stdscr.getch() != ord('q'):
                pass
            break

        time.sleep(DELAY)

if __name__ == "__main__":
    curses.wrapper(main)
