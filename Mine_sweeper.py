import random


class Mine_sweeper:
    def __init__(self, rows,columns):
        self.size = (rows,columns)
        self.num_mines = int(rows * columns / 5)
        self.board = [[0] * self.size[1] for _ in range(self.size[0])]
        self.mines = set()
        self._generate_mines()

    def _generate_mines(self):
        print(self.num_mines)
        while len(self.mines) < self.num_mines:
            x = random.randint(0, self.size[0] - 1)
            y = random.randint(0, self.size[1] - 1)

            if (x, y) not in self.mines:
                self.mines.add((x, y))
                self.board[x][y] = 'X'

    def print_board(self):
        for row in self.board:
            print(' '.join(str(cell) for cell in row))
    
    def get_rows(self):
        return int(self.size[0])
    
    def get_cols(self):
        return int(self.size[1])
    
    def get_board(self):
        return self.board

    def get_adjacent_mine_count(self, x, y):
        if self.board[x][y] == 'X':
            return -1 

        count = 0
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                nx = x + dx
                ny = y + dy
                if 0 <= nx < self.size[0] and 0 <= ny < self.size[1] and self.board[nx][ny] == 'X':
                    count += 1
        
        return count