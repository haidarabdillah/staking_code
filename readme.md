## Dokumen Teknis Kontrak SmartChefInitializable

### Deskripsi Umum

Kontrak **SmartChefInitializable** adalah smart contract staking yang memungkinkan pengguna untuk menyetor (stake) token tertentu dan mendapatkan hadiah dalam bentuk token lainnya. Kontrak ini dilengkapi dengan fitur-fitur seperti batasan jumlah staking per pengguna, pengaturan waktu mulai dan berakhirnya distribusi hadiah, serta mekanisme keamanan untuk melindungi aset pengguna.

### Struktur Data Utama

- **UserInfo**: Struktur data yang menyimpan informasi staking pengguna.
  - `amount`: Jumlah token yang disetor oleh pengguna.
  - `rewardDebt`: Jumlah reward yang belum diklaim oleh pengguna.

### Variabel State Utama

- `SMART_CHEF_FACTORY`: Alamat pabrik kontrak yang membuat kontrak ini.
- `userLimit`: Boolean yang menunjukkan apakah ada batasan jumlah staking per pengguna.
- `isInitialized`: Boolean yang menunjukkan apakah kontrak telah diinisialisasi.
- `accTokenPerShare`: Akumulasi token per share untuk menghitung reward.
- `bonusEndBlock`: Blok terakhir distribusi hadiah.
- `startBlock`: Blok awal distribusi hadiah.
- `lastRewardBlock`: Blok terakhir kali pool diperbarui.
- `poolLimitPerUser`: Batas jumlah token yang dapat distake per pengguna.
- `numberBlocksForUserLimit`: Jumlah blok setelah startBlock di mana batas pengguna berlaku.
- `rewardPerBlock`: Jumlah token hadiah yang didistribusikan per blok.
- `PRECISION_FACTOR`: Faktor presisi untuk perhitungan akumulasi.
- `rewardToken`: Token yang digunakan sebagai hadiah.
- `stakedToken`: Token yang distake oleh pengguna.
- `stakedTokenAmount`: Jumlah total token yang distake di kontrak.
- `userInfo`: Mapping yang menyimpan informasi staking per pengguna.

### Events

- **Deposit**: Dihasilkan saat pengguna melakukan deposit token.
- **Withdraw**: Dihasilkan saat pengguna menarik token.
- **EmergencyWithdraw**: Dihasilkan saat pengguna melakukan penarikan darurat.
- **TokenRecovery**: Dihasilkan saat pemilik kontrak memulihkan token yang dikirim secara tidak sengaja.
- **NewStartAndEndBlocks**: Dihasilkan saat pemilik kontrak memperbarui blok awal dan akhir.
- **NewRewardPerBlock**: Dihasilkan saat pemilik kontrak memperbarui jumlah reward per blok.
- **NewPoolLimit**: Dihasilkan saat pemilik kontrak memperbarui batas staking per pengguna.
- **RewardsStop**: Dihasilkan saat distribusi reward dihentikan.

### Fungsi-Fungsi Kontrak

#### 1. `constructor()`

```solidity
constructor() {
    SMART_CHEF_FACTORY = msg.sender;
}
```

**Deskripsi:**
Konstruktor kontrak yang menyimpan alamat pabrik kontrak (`SMART_CHEF_FACTORY`) yang membuat kontrak ini.

**Parameter:**
Tidak ada.

**Akses:**
Hanya dipanggil sekali saat kontrak dibuat.

#### 2. `initialize(...)`

```solidity
function initialize(
    IERC20Metadata _stakedToken,
    IERC20Metadata _rewardToken,
    uint256 _rewardPerBlock,
    uint256 _startBlock,
    uint256 _bonusEndBlock,
    uint256 _poolLimitPerUser,
    uint256 _numberBlocksForUserLimit,
    address _admin
) external {
    // Implementasi
}
```

**Deskripsi:**
Fungsi untuk menginisialisasi kontrak dengan parameter-parameter penting seperti token yang distake, token reward, jumlah reward per blok, blok mulai dan akhir distribusi, batas staking per pengguna, dan alamat admin.

**Parameter:**
- `_stakedToken`: Alamat token yang akan distake.
- `_rewardToken`: Alamat token yang akan diberikan sebagai reward.
- `_rewardPerBlock`: Jumlah token reward yang didistribusikan per blok.
- `_startBlock`: Blok di mana distribusi reward dimulai.
- `_bonusEndBlock`: Blok di mana distribusi reward berakhir.
- `_poolLimitPerUser`: Batas maksimum token yang dapat distake per pengguna (0 jika tidak ada batas).
- `_numberBlocksForUserLimit`: Jumlah blok setelah `startBlock` dimana batas pengguna berlaku.
- `_admin`: Alamat admin yang akan menjadi pemilik kontrak.

**Persyaratan:**
- Kontrak belum diinisialisasi (`!isInitialized`).
- Hanya dapat dipanggil oleh pabrik kontrak (`msg.sender == SMART_CHEF_FACTORY`).

**Proses:**
1. Menandai kontrak sebagai sudah diinisialisasi.
2. Mengatur token yang distake dan token reward.
3. Mengatur reward per blok, start block, dan bonus end block.
4. Jika `poolLimitPerUser` > 0, mengaktifkan batas pengguna dan mengatur batas serta jumlah bloknya.
5. Menghitung `PRECISION_FACTOR` berdasarkan desimal token reward.
6. Mengatur `lastRewardBlock` ke `startBlock`.
7. Memindahkan kepemilikan kontrak ke alamat admin.

#### 3. `deposit(uint256 _amount)`

```solidity
function deposit(uint256 _amount) external nonReentrant {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pengguna untuk menyetor token yang akan distake dan mengklaim reward yang telah diperoleh.

**Parameter:**
- `_amount`: Jumlah token yang akan distake.

**Persyaratan:**
- Jika `userLimit` aktif, jumlah staking setelah deposit tidak melebihi `poolLimitPerUser`.

**Proses:**
1. Mengambil data pengguna dari `userInfo`.
2. Memeriksa apakah batas pengguna masih aktif melalui `hasUserLimit()`.
3. Jika ada batas, memastikan deposit tidak melebihi batas.
4. Memperbarui pool melalui `_updatePool()`.
5. Jika pengguna sudah memiliki stake, menghitung pending reward dan mentransfer reward ke pengguna.
6. Jika `_amount` > 0, transfer token yang distake dari pengguna ke kontrak melalui `_depositStakedToken()`.
7. Mengupdate `rewardDebt` pengguna.
8. Memancarkan event `Deposit`.

#### 4. `withdraw(uint256 _amount)`

```solidity
function withdraw(uint256 _amount) external nonReentrant {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pengguna untuk menarik kembali sejumlah token yang telah distake serta mengklaim reward yang diperoleh.

**Parameter:**
- `_amount`: Jumlah token yang akan ditarik.

**Persyaratan:**
- Pengguna harus memiliki setidaknya `_amount` token yang distake (`user.amount >= _amount`).

**Proses:**
1. Mengambil data pengguna dari `userInfo`.
2. Memastikan pengguna memiliki cukup token yang distake.
3. Memperbarui pool melalui `_updatePool()`.
4. Menghitung pending reward.
5. Jika `_amount` > 0, mengurangi `user.amount` dan mentransfer token yang distake melalui `_withdrawStakedToken()`.
6. Jika pending reward > 0, mentransfer reward melalui `_withdrawRewardToken()`.
7. Mengupdate `rewardDebt` pengguna.
8. Memancarkan event `Withdraw`.

#### 5. `emergencyWithdraw()`

```solidity
function emergencyWithdraw() external nonReentrant {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pengguna untuk menarik semua token yang telah distake tanpa mengklaim reward, digunakan dalam keadaan darurat.

**Parameter:**
Tidak ada.

**Persyaratan:**
- Tidak ada selain pengguna harus memiliki stake.

**Proses:**
1. Mengambil data pengguna dari `userInfo`.
2. Menyimpan jumlah token yang akan ditransfer (`amountToTransfer`).
3. Mengatur `user.amount` dan `user.rewardDebt` ke 0.
4. Jika `amountToTransfer` > 0, mentransfer token melalui `_withdrawStakedToken()`.
5. Memancarkan event `EmergencyWithdraw`.

#### 6. `emergencyRewardWithdraw(uint256 _amount)`

```solidity
function emergencyRewardWithdraw(uint256 _amount) external onlyOwner {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pemilik kontrak untuk menarik sejumlah token reward dari kontrak, digunakan dalam keadaan darurat.

**Parameter:**
- `_amount`: Jumlah token reward yang akan ditarik.

**Persyaratan:**
- Hanya pemilik kontrak yang dapat memanggil (`onlyOwner`).

**Proses:**
1. Memanggil fungsi internal `_withdrawRewardToken(_amount)` untuk mentransfer token reward ke pemilik.

#### 7. `recoverToken(address _token)`

```solidity
function recoverToken(address _token) external onlyOwner {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pemilik kontrak untuk memulihkan token yang dikirim ke kontrak secara tidak sengaja, kecuali token reward.

**Parameter:**
- `_token`: Alamat token yang ingin dipulihkan.

**Persyaratan:**
- `_token` tidak boleh sama dengan `rewardToken`.

**Proses:**
1. Mendapatkan saldo kontrak dari token `_token`.
2. Jika `_token` sama dengan `stakedToken`, mengurangi saldo dengan `stakedTokenAmount`.
3. Memastikan saldo yang akan dipulihkan tidak nol.
4. Transfer saldo ke pemilik kontrak menggunakan `safeTransfer`.
5. Memancarkan event `TokenRecovery`.

#### 8. `stopReward()`

```solidity
function stopReward() external onlyOwner {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pemilik kontrak untuk menghentikan distribusi reward dengan mengatur `bonusEndBlock` ke blok saat ini.

**Parameter:**
Tidak ada.

**Persyaratan:**
- Hanya pemilik kontrak yang dapat memanggil (`onlyOwner`).

**Proses:**
1. Mengatur `bonusEndBlock` ke `block.number`.
2. Memancarkan event `RewardsStop`.

#### 9. `updatePoolLimitPerUser(bool _userLimit, uint256 _poolLimitPerUser)`

```solidity
function updatePoolLimitPerUser(bool _userLimit, uint256 _poolLimitPerUser) external onlyOwner {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pemilik kontrak untuk memperbarui batas jumlah token yang dapat distake per pengguna.

**Parameter:**
- `_userLimit`: Boolean yang menentukan apakah batas akan tetap diberlakukan.
- `_poolLimitPerUser`: Jumlah batas baru per pengguna.

**Persyaratan:**
- Jika `_userLimit` adalah `true`, maka `_poolLimitPerUser` harus lebih besar dari `poolLimitPerUser` saat ini.
- Jika `_userLimit` adalah `false`, maka `poolLimitPerUser` diatur ke 0 dan `userLimit` diatur ke `false`.

**Proses:**
1. Memastikan `userLimit` awal adalah `true`.
2. Jika `_userLimit` adalah `true`, memastikan bahwa `_poolLimitPerUser` lebih besar dari `poolLimitPerUser` saat ini.
3. Jika `_userLimit` adalah `false`, mengatur `userLimit` menjadi `false` dan `poolLimitPerUser` menjadi 0.
4. Mengatur `poolLimitPerUser`.
5. Memancarkan event `NewPoolLimit`.

#### 10. `updateRewardPerBlock(uint256 _rewardPerBlock)`

```solidity
function updateRewardPerBlock(uint256 _rewardPerBlock) external onlyOwner {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pemilik kontrak untuk memperbarui jumlah token reward yang didistribusikan per blok sebelum kontrak dimulai.

**Parameter:**
- `_rewardPerBlock`: Jumlah reward baru per blok.

**Persyaratan:**
- Hanya dapat dipanggil sebelum pool dimulai (`block.number < startBlock`).

**Proses:**
1. Memeriksa bahwa blok saat ini kurang dari `startBlock`.
2. Mengupdate `rewardPerBlock` dengan nilai baru.
3. Memancarkan event `NewRewardPerBlock`.

#### 11. `updateStartAndEndBlocks(uint256 _startBlock, uint256 _bonusEndBlock)`

```solidity
function updateStartAndEndBlocks(uint256 _startBlock, uint256 _bonusEndBlock) external onlyOwner {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pemilik kontrak untuk memperbarui blok awal dan blok akhir distribusi reward sebelum kontrak dimulai.

**Parameter:**
- `_startBlock`: Blok baru untuk memulai distribusi reward.
- `_bonusEndBlock`: Blok baru untuk mengakhiri distribusi reward.

**Persyaratan:**
- Hanya dapat dipanggil sebelum pool dimulai (`block.number < startBlock`).
- `_startBlock` harus kurang dari `_bonusEndBlock`.
- `_startBlock` harus lebih besar dari blok saat ini (`block.number < _startBlock`).

**Proses:**
1. Memeriksa bahwa blok saat ini kurang dari `startBlock`.
2. Memeriksa bahwa `_startBlock` < `_bonusEndBlock`.
3. Memeriksa bahwa blok saat ini kurang dari `_startBlock`.
4. Mengupdate `startBlock` dan `bonusEndBlock`.
5. Mengatur `lastRewardBlock` ke `startBlock`.
6. Memancarkan event `NewStartAndEndBlocks`.

#### 12. `pendingReward(address _user)`

```solidity
function pendingReward(address _user) external view returns (uint256) {
    // Implementasi
}
```

**Deskripsi:**
Fungsi ini memungkinkan pengguna atau pihak lain untuk melihat jumlah reward yang pending (belum diklaim) untuk seorang pengguna tertentu.

**Parameter:**
- `_user`: Alamat pengguna yang ingin dilihat pending reward-nya.

**Proses:**
1. Mengambil data pengguna dari `userInfo`.
2. Jika blok saat ini > `lastRewardBlock` dan ada staking (`stakedTokenAmount` != 0):
   - Menghitung `multiplier` dengan `_getMultiplier(lastRewardBlock, block.number)`.
   - Menghitung `cakeReward` sebagai `multiplier * rewardPerBlock`.
   - Menghitung `adjustedTokenPerShare` sebagai `accTokenPerShare + (cakeReward * PRECISION_FACTOR) / stakedTokenAmount`.
   - Menghitung pending reward sebagai `(user.amount * adjustedTokenPerShare) / PRECISION_FACTOR - user.rewardDebt`.
3. Jika tidak, pending reward adalah `(user.amount * accTokenPerShare) / PRECISION_FACTOR - user.rewardDebt`.
4. Mengembalikan nilai pending reward.

#### 13. `_depositStakedToken(uint256 _amount)`

```solidity
function _depositStakedToken(uint256 _amount) internal returns (uint256 _received) {
    // Implementasi
}
```

**Deskripsi:**
Fungsi internal untuk menyetor token yang distake oleh pengguna ke kontrak.

**Parameter:**
- `_amount`: Jumlah token yang akan disetor.

**Proses:**
1. Mendapatkan saldo token staked sebelum transfer (`balanceBefore`).
2. Mentransfer token dari pengguna ke kontrak menggunakan `safeTransferFrom`.
3. Menghitung jumlah token yang diterima (`_received`) sebagai saldo setelah transfer - `balanceBefore`.
4. Menambah `stakedTokenAmount` dengan `_received`.
5. Mengembalikan `_received`.

#### 14. `_withdrawStakedToken(uint256 _amount)`

```solidity
function _withdrawStakedToken(uint256 _amount) internal {
    // Implementasi
}
```

**Deskripsi:**
Fungsi internal untuk menarik token yang distake oleh pengguna dari kontrak.

**Parameter:**
- `_amount`: Jumlah token yang akan ditarik.

**Proses:**
1. Mengurangi `stakedTokenAmount` dengan `_amount`.
2. Mentransfer token dari kontrak ke pengguna menggunakan `safeTransfer`.

#### 15. `_withdrawRewardToken(uint256 _amount)`

```solidity
function _withdrawRewardToken(uint256 _amount) internal {
    // Implementasi
}
```

**Deskripsi:**
Fungsi internal untuk mentransfer token reward ke pengguna.

**Parameter:**
- `_amount`: Jumlah token reward yang akan ditransfer.

**Proses:**
1. Mentransfer `_amount` token reward dari kontrak ke pengguna menggunakan `safeTransfer`.
2. Jika `rewardToken` sama dengan `stakedToken`, memastikan saldo `stakedToken` di kontrak >= `stakedTokenAmount`.

#### 16. `_updatePool()`

```solidity
function _updatePool() internal {
    // Implementasi
}
```

**Deskripsi:**
Fungsi internal untuk memperbarui variabel distribusi reward pool agar up-to-date.

**Proses:**
1. Jika blok saat ini <= `lastRewardBlock`, keluar dari fungsi.
2. Jika tidak ada staking (`stakedTokenAmount` == 0), set `lastRewardBlock` ke blok saat ini dan keluar dari fungsi.
3. Menghitung `multiplier` dengan `_getMultiplier(lastRewardBlock, block.number)`.
4. Menghitung `cakeReward` sebagai `multiplier * rewardPerBlock`.
5. Mengupdate `accTokenPerShare` dengan menambahkan `(cakeReward * PRECISION_FACTOR) / stakedTokenAmount`.
6. Mengupdate `lastRewardBlock` ke blok saat ini.

#### 17. `_getMultiplier(uint256 _from, uint256 _to)`

```solidity
function _getMultiplier(uint256 _from, uint256 _to) internal view returns (uint256) {
    // Implementasi
}
```

**Deskripsi:**
Fungsi internal untuk menghitung multiplier reward antara dua blok tertentu.

**Parameter:**
- `_from`: Blok awal.
- `_to`: Blok akhir.

**Proses:**
1. Jika `_to` <= `bonusEndBlock`, return `_to - _from`.
2. Else if `_from` >= `bonusEndBlock`, return 0.
3. Else, return `bonusEndBlock - _from`.

#### 18. `hasUserLimit()`

```solidity
function hasUserLimit() public view returns (bool) {
    // Implementasi
}
```

**Deskripsi:**
Fungsi publik untuk memeriksa apakah batas staking per pengguna masih aktif.

**Proses:**
1. Jika `!userLimit` atau `block.number >= (startBlock + numberBlocksForUserLimit)`, return `false`.
2. Else, return `true`.

### Mekanisme Keamanan

1. **ReentrancyGuard**: Semua fungsi yang berpotensi memodifikasi state dan melakukan transfer token dilindungi oleh modifier `nonReentrant` untuk mencegah serangan reentrancy.

2. **Ownable**: Kontrak menggunakan `Ownable` dari OpenZeppelin, yang memungkinkan hanya pemilik kontrak (admin) yang dapat memanggil fungsi-fungsi tertentu seperti `updateRewardPerBlock`, `updateStartAndEndBlocks`, `updatePoolLimitPerUser`, `stopReward`, `emergencyRewardWithdraw`, dan `recoverToken`.

3. **Validasi Input**: Penggunaan `require` statements memastikan bahwa kondisi tertentu terpenuhi sebelum melanjutkan eksekusi, seperti memastikan bahwa `initialize` hanya dipanggil sekali dan oleh pabrik kontrak, serta memastikan bahwa batas staking per pengguna tidak dilanggar.

4. **Pengamanan Token**: Fungsi `recoverToken` memungkinkan pemilik kontrak untuk memulihkan token yang dikirim secara tidak sengaja ke kontrak, kecuali token reward, sehingga mencegah hilangnya aset pengguna.

5. **Cek Keseimbangan Token**: Fungsi `_withdrawRewardToken` memastikan bahwa jika `rewardToken` sama dengan `stakedToken`, saldo `stakedToken` di kontrak harus cukup untuk menutupi `stakedTokenAmount`, mencegah over-withdraw.

6. **Kontrol Akses**: Hanya pemilik kontrak yang dapat memanggil fungsi-fungsi sensitif, menjaga kontrol penuh atas pengaturan dan manajemen kontrak.

### Alur Kerja Kontrak

1. **Deployment dan Inisialisasi**:
   - Kontrak dideploy dan alamat pabrik kontrak disimpan di `SMART_CHEF_FACTORY`.
   - Fungsi `initialize` dipanggil oleh pabrik kontrak untuk mengatur parameter awal seperti token yang distake, token reward, reward per blok, blok mulai dan akhir, batas staking per pengguna, serta alamat admin.

2. **Staking (Deposit)**:
   - Pengguna memanggil fungsi `deposit` dengan jumlah token yang ingin distake.
   - Kontrak memeriksa batas staking jika diaktifkan, memperbarui pool, menghitung dan mentransfer reward yang pending, serta menyimpan jumlah staking baru.

3. **Penarikan (Withdraw)**:
   - Pengguna memanggil fungsi `withdraw` dengan jumlah token yang ingin ditarik.
   - Kontrak memeriksa apakah pengguna memiliki cukup staking, memperbarui pool, menghitung pending reward, mentransfer token yang ditarik dan reward ke pengguna, serta memperbarui `rewardDebt`.

4. **Penarikan Darurat (Emergency Withdraw)**:
   - Pengguna memanggil fungsi `emergencyWithdraw` untuk menarik semua token yang distake tanpa mengklaim reward, digunakan dalam keadaan darurat.

5. **Manajemen Admin**:
   - Pemilik kontrak dapat memanggil fungsi-fungsi seperti `updateRewardPerBlock`, `updateStartAndEndBlocks`, `updatePoolLimitPerUser`, `stopReward`, `emergencyRewardWithdraw`, dan `recoverToken` untuk mengatur dan mengelola kontrak sesuai kebutuhan.

6. **Distribusi Reward**:
   - Reward didistribusikan setiap blok antara `startBlock` hingga `bonusEndBlock` berdasarkan jumlah staking dan `rewardPerBlock`.
   - Fungsi internal `_updatePool` memastikan bahwa `accTokenPerShare` dan `lastRewardBlock` diperbarui sesuai dengan perkembangan blok.

7. **Penghentian Reward**:
   - Pemilik kontrak dapat menghentikan distribusi reward kapan saja dengan memanggil `stopReward`, yang mengatur `bonusEndBlock` ke blok saat ini.

### Kesimpulan

Kontrak **SmartChefInitializable** adalah solusi staking yang fleksibel dan aman, menawarkan berbagai fitur untuk mengelola staking token dan distribusi reward. Dengan mekanisme kontrol akses yang kuat, validasi input yang ketat, dan proteksi terhadap serangan reentrancy, kontrak ini dirancang untuk memastikan keamanan dan efisiensi dalam operasional staking. Dokumentasi ini diharapkan dapat membantu dalam memahami setiap fungsi dan mekanisme yang ada dalam kontrak ini.

