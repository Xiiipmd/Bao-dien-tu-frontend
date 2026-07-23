# Bao dien tu frontend

## Quy tac lam viec nhom
1. Nhanh `main` dung de chua ma nguon hoan thien.
2. Nhanh `dev` chua code duoc merge tu `feature` vao, dung de test code.
3. Khi day mot tinh nang moi len GitHub: phai dat ten nhanh theo format `feature/<Ten tinh nang bang tieng Anh>`.
4. Moi khi bat dau code: chay `git pull` tren Terminal de keo code moi ve.
5. Khi muon day code moi len GitHub: khong duoc push truc tiep vao nhanh `main`, ma phai tao pull request moi va bat `@Copilot` review code truoc khi merge.
6. Commit message phai co y nghia, lam cho nguoi khac hieu.
7. Xong mot feature thi phai commit roi push len GitHub ngay.
8. Workflow phai pass thi moi duoc merge pull request.

## Quy trinh day code
1. Cap nhat code moi nhat:
   ```bash
   git pull
   ```
2. Tao nhanh feature:
   ```bash
   git checkout -b feature/<feature-name>
   ```
3. Commit thay doi voi message ro nghia:
   ```bash
   git add .
   git commit -m "Describe the feature clearly"
   ```
4. Push nhanh feature:
   ```bash
   git push -u origin feature/<feature-name>
   ```
5. Tao pull request vao `dev` neu co nhanh `dev`; chi merge vao `main` khi code da hoan thien va workflow pass.

## Chay du an
1. Cai dependencies:
   ```bash
   npm ci
   ```
2. Chay development server:
   ```bash
   npm run dev
   ```
3. Kiem tra build:
   ```bash
   npm run build
   ```
