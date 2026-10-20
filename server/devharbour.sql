-- Dev Harbour Authoritative Database Dump
-- Generated: 2026-10-20T13:04:02.613Z

PRAGMA foreign_keys = OFF;

-- Table: users
CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin')),
      avatar_url TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      github_url TEXT DEFAULT '',
      portfolio_url TEXT DEFAULT '',
      streak_days INTEGER DEFAULT 0,
      last_active_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    , location TEXT DEFAULT '');

INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-admin-parth', 'parthvgidde@gmail.com', 'parth', 'Parth Gidde', '6a2dbb1cf46d031e4f3923f2c402e71a9af2346977cb8e35a3aa9ab50dba70e70454edbe75f66959dedf87a05f09f782c97a60effbd8d3ac58c59a6df98b84e8', '40e9d2a40b71bce84b0ca4db457079f6', 'admin', '', 'Co-Founder & Managing Director @ Dev Harbour', 'https://github.com/parthvgidde', '', 0, NULL, '2026-10-20 07:06:29', '2026-10-20 07:06:29', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-ayesha', 'ayesha.sample@devharbour.in', 'ayesha', 'Ayesha Khan', '6a2dbb1cf46d031e4f3923f2c402e71a9af2346977cb8e35a3aa9ab50dba70e70454edbe75f66959dedf87a05f09f782c97a60effbd8d3ac58c59a6df98b84e8', '40e9d2a40b71bce84b0ca4db457079f6', 'student', '', 'Developer in Dev Harbour community.', '', '', 1, '2026-10-20', '2026-10-20 07:06:29', '2026-10-20 07:06:29', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-kabir', 'kabir.sample@devharbour.in', 'kabir', 'Kabir Verma', '6a2dbb1cf46d031e4f3923f2c402e71a9af2346977cb8e35a3aa9ab50dba70e70454edbe75f66959dedf87a05f09f782c97a60effbd8d3ac58c59a6df98b84e8', '40e9d2a40b71bce84b0ca4db457079f6', 'student', '', 'Developer in Dev Harbour community.', '', '', 0, NULL, '2026-10-20 07:06:29', '2026-10-20 07:06:29', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-mei', 'mei.sample@devharbour.in', 'mei', 'Mei Chen', '6a2dbb1cf46d031e4f3923f2c402e71a9af2346977cb8e35a3aa9ab50dba70e70454edbe75f66959dedf87a05f09f782c97a60effbd8d3ac58c59a6df98b84e8', '40e9d2a40b71bce84b0ca4db457079f6', 'student', '', 'Developer in Dev Harbour community.', '', '', 0, NULL, '2026-10-20 07:06:29', '2026-10-20 07:06:29', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-nora', 'nora.sample@devharbour.in', 'nora', 'Nora Davis', '6a2dbb1cf46d031e4f3923f2c402e71a9af2346977cb8e35a3aa9ab50dba70e70454edbe75f66959dedf87a05f09f782c97a60effbd8d3ac58c59a6df98b84e8', '40e9d2a40b71bce84b0ca4db457079f6', 'student', '', 'Developer in Dev Harbour community.', '', '', 0, NULL, '2026-10-20 07:06:29', '2026-10-20 07:06:29', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-1a2a02cd', 'student_1792481522074@devharbour.in', 'dev_522074', 'Test Developer', '117797f6837f6272a51a2e507135c0bb88841f04e837c10abf55c25ddec2765ae3a9e4837c663a3c1249ff7c04a621d51656adbe1a7d15d6cb0c03e12b29a8c6', '8a362a35425994fdb726c7ba0d5ea942', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:32:02', '2026-10-20 07:32:02', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-5dd58e4b', 'reader_1792481522577@devharbour.in', 'reader_522577', 'Avid Reader', 'dc8d5d39dc5ce9a0d32f5a2059067353876023dcf4445e5ad93d4d9a0f3c76d829832bd4321977419852010fafa3e173e56b35cc754a79375168605281e598e7', '0e2bd3cfb582f26a3024e37a8c2e3018', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:32:02', '2026-10-20 07:32:02', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-0dcba3b7', 'student_1792482961121@devharbour.in', 'dev_961121', 'Test Developer', '30b8ffde1e05a1b16d96951a4f9102bba281ae6066ac97a146cf4f6cc3d5b3f4c984b116618c32c3c0c072eef2d64540623ce934cf9acfd50e2dcd64641ca082', '28b52e565ecafc50a04dbd296d493f2d', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:56:01', '2026-10-20 07:56:01', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-6788c2a6', 'reader_1792482961493@devharbour.in', 'reader_961493', 'Avid Reader', '9540a1706e1a7c72552669d6722aed09e6bec1b2da63a398881c93c02a42ab4bcbfc6b642e3f31c73509f6f1976f0d77579ed5e3c4b984ee23e0475fdc8595f9', '24a1759158c33ad42c5ae0479ed21e49', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:56:01', '2026-10-20 07:56:01', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-9b19e8ac', 'coder_1792482964729@devharbour.in', 'coder_964729', 'Code Challenger', '544a09b370580c166258607f9f78410439f1887b5eeebdfece19dc8381d9bf7274812a95cba71961f69626c6c93d6dbd2007ed5d9e706c115d56a1a56c9d24c3', 'c725428505887a54cdaa84c50929a1f3', 'student', '', '', '', '', 0, NULL, '2026-10-20 07:56:04', '2026-10-20 07:56:04', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-4ab882a5', 'builder_1792482964916@devharbour.in', 'build_964916', 'Project Builder', '646b35c61e6eee7860a8ae50a0b096915025a0b8a8f0ba2ab7a6a440b6476dc46e10b2b08a04721b137e7e6596bf0f5cf58bb722ffa3ece0f7acc4e2fa183a28', '125183eb93080c140a95b96788d3270f', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:56:05', '2026-10-20 07:56:05', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-30cfe77f', 'intruder_1792482965096@devharbour.in', 'intrude_965096', 'Other User', '28eba067682c75709b5d2d170bdcf2b3513ce8b6e457aee4a35fb74af37134fdd3bc833738beabf28287d36a516b9e1731cc06fb18e570d535f5f262bf51a8e2', 'bcb9967ebf36dafcf2439eb6834c85e8', 'student', '', '', '', '', 0, NULL, '2026-10-20 07:56:05', '2026-10-20 07:56:05', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-334bf6a5', 'settings_1792482965262@devharbour.in', 'set_965262', 'Settings User', '0c5d65135355ae2bcec15f805fd075cff74fbef49b5b15b5d6ead678c0aa1574fad24fe9157c10f25e4bf27f311d4c5123a0eb3e37278c24a16ba8454c362d06', '922a901ad65b8998219746248af52b53', 'student', '', '', '', '', 0, NULL, '2026-10-20 07:56:05', '2026-10-20 07:56:05', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-c6923888', 'student_1792483054493@devharbour.in', 'dev_054493', 'Test Developer', 'e5bf28a08927959988bb03a0f906589b730b24367a09a91a8af55844d538852b687924841356200aaf2051e497fa4a103abf71dc297ff775d01ba3402ad867a9', '38cc90a17999fe6d5b937b408ac582d7', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:57:34', '2026-10-20 07:57:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-1bc223a4', 'reader_1792483054862@devharbour.in', 'reader_054862', 'Avid Reader', '7468fbf3c695ac62a7dd6ed075e6a58b707f2abd9dc6fe51e82fdc1ba4a0851457153661b4f07677d7e661bf26a6227a1867ce39e822ac443111094f770149c3', 'f9b206913149f345830bb4259cb6e4f7', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:57:34', '2026-10-20 07:57:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-6d7c113c', 'coder_1792483058070@devharbour.in', 'coder_058070', 'Code Challenger', 'c8bf6f12b1d22b4dbabef89db8b589d134efc36f8c85c0530ed3508dbaf7d356b29503ce410266f0e51cfe0e4d5dbdf9e07025cd796183adbf92974948bf376b', '82dd1072daed81ca4b5c812762f0dd29', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:57:38', '2026-10-20 07:57:38', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-8cb67e6b', 'builder_1792483058222@devharbour.in', 'build_058222', 'Project Builder', 'bf3c18998492e18c423c409975322bf71d4d7440bfee67517e5bfa4ade83ab5fb43dd8826d81dbd7b8ed9aff31af647fa06b0e1fe80da6bfd00293f6349e7199', '7bcb438fd897b7fe5810c504c43e4449', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:57:38', '2026-10-20 07:57:38', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-ddb3add6', 'intruder_1792483058405@devharbour.in', 'intrude_058405', 'Other User', '623336f829fe1904e111489f22e650265fcaf5be171de5f0c4295d459992e2ebc0be13ff7244c976888af650e8f099c5cee90cdcc4b554d1e26d6f84cb6b34ae', 'e4667078de99f63c37431d78a2c529af', 'student', '', '', '', '', 0, NULL, '2026-10-20 07:57:38', '2026-10-20 07:57:38', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-0dc7c690', 'settings_1792483058534@devharbour.in', 'set_058534', 'Settings User', '59eb741342dc640c5a24c06e5f7b98ba8768c427f33360da071284fee1adc784f3ddb907e888bcce3ed1589aac6c31261028b8e7bf19a893b1f7c3e632f3eed9', '4da4406537bfe02a5ae6fb5d686547e0', 'student', '', '', '', '', 0, NULL, '2026-10-20 07:57:38', '2026-10-20 07:57:38', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-15d1aa41', 'student_1792483093359@devharbour.in', 'dev_093359', 'Test Developer', '184fe36d3d246fd4b3551dd9919da0b4272e03c02512c0958c149371c92ddde2727f6dc2aceba10a52992f9507afd86817a4193e2135b34932eaca9af0757431', 'b6296031e1f86dede31ec177123331f0', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:58:13', '2026-10-20 07:58:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-865d1581', 'reader_1792483093664@devharbour.in', 'reader_093664', 'Avid Reader', '6310d1a6dc395bfd33d8c27fbe37412a299fcf0c7eac90c66085ad4a544802715b9e05453109a67ba895f433f08a26c1290f48c87b9ec71e4bba21e67ddca95d', 'fb3cea6be00fed680bfd4a052a480691', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:58:13', '2026-10-20 07:58:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-18368ae6', 'coder_1792483096844@devharbour.in', 'coder_096844', 'Code Challenger', '7c133535de224bf879c2aac97de65dfefef5b4cb210ce01bca159e8f7bef16f2ca095d2b15f0dc3f6c8622bf6876961cc24938165410dbd9653601ee1dbc56be', '986775ecb7dd6e48ee25437f8dd05416', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:58:16', '2026-10-20 07:58:16', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-f38d3cef', 'builder_1792483097018@devharbour.in', 'build_097018', 'Project Builder', '1bb7fcfeebab52ad74b0aad8cedb3c8e54c914372e4a6a15f5e38cb9885c23551b4f9f8327dda0b44b63469f31ee9b47fa21bc822b76075349688300c67f5258', 'b7132b45476a40b4f29614bda81fb8cf', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 07:58:17', '2026-10-20 07:58:17', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-1e2878b2', 'intruder_1792483097193@devharbour.in', 'intrude_097193', 'Other User', '2b7b0ab9906a962919508aae54142a4b86ddfeceabd824c87bf4de3e23dab2e5dcf04e064f9a765acba6cc8fb01c9e1a52dd9404d6a3aeab62ee94051a517751', '8ff36751413462b4cd2e3860a3a00d09', 'student', '', '', '', '', 0, NULL, '2026-10-20 07:58:17', '2026-10-20 07:58:17', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-e051e843', 'settings_1792483097306@devharbour.in', 'set_097306', 'Settings User', 'da36517b41b9cc0342c1bd35841b62de7bdcd84015f82b8438be8de5ee28e12de7a87be7003e54b0323219eb688ff13edc11bcfebc02ef10f692d36edeba0cc9', 'd3ba0a494f15463d066af2252950868c', 'student', '', '', '', '', 0, NULL, '2026-10-20 07:58:17', '2026-10-20 07:58:17', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-6773ab87', 'student_1792483904303@devharbour.in', 'dev_904303', 'Test Developer', '40875f8ae2c2a241d9733924a4fa8fb23a4099433e18685fb69764b4b7349bdf4e4ab77ff25a17df86fbaee2548ceb37d24118b175963dc966831e9f6fa30821', 'a514a6c401bd59ded83509d98ccdb21f', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:11:44', '2026-10-20 08:11:44', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-bb7465ba', 'reader_1792483904781@devharbour.in', 'reader_904781', 'Avid Reader', '899a1974f6ab8d77fda7dbd7e88af96719c0f0b5087410241faf1ab7bd74f480cae3b9ce7c6e413bc7ac8439592f86ebc6aa1b67cd1d040ebf1e682dc7f4be7d', '85e6989b5cc840d21371854acb820c5a', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:11:44', '2026-10-20 08:11:44', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-26836243', 'coder_1792483908048@devharbour.in', 'coder_908048', 'Code Challenger', '26f9ff11a301697b5b85bae90039ab928ee5244b64129132ec157dcb7ed291c1983334615378bea369a308a3c3c66096f3c135554905c1b224bda3723618954a', '1a7034f1a6b8feab427b928853b0590a', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:11:48', '2026-10-20 08:11:48', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-258d9c44', 'builder_1792483908255@devharbour.in', 'build_908255', 'Project Builder', '72f2e7b5976f69133384fe94e74bb0e9d94fb2772a7e43a310c490ed2d9ceddea29ad36bd20a60b17f15faf230b6becfcfb6058b97d31749449c54b1e951a881', 'fd3c4a0bd8aa8059dd61089687f7d7dc', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:11:48', '2026-10-20 08:11:48', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-cf986487', 'intruder_1792483908436@devharbour.in', 'intrude_908436', 'Other User', '1ecc42b23102f4fdf86aa23471f07126f26c5e48d959c0c6a65038c07e4dc4e41ff6a974bc7f30bd1b2dca4f4d6bdea7f0f83249d4ad20e650567506a5457c7e', 'a02de24828d073a23a66238af478a2ac', 'student', '', '', '', '', 0, NULL, '2026-10-20 08:11:48', '2026-10-20 08:11:48', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-206484ea', 'settings_1792483908582@devharbour.in', 'set_908582', 'Settings User', 'aff5c357d71cbf2d492b96af6b5d3800e65e55d285a7868b30ccb20688f11ae092a8bf1483606f30085512461b76885a613403ffed364142073a85ea4e17f77e', '2d42de9daf88ce7c0357730396d6851a', 'student', '', '', '', '', 0, NULL, '2026-10-20 08:11:48', '2026-10-20 08:11:48', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-7d384ef6', 'student_1792485346840@devharbour.in', 'dev_346840', 'Test Developer', '6450136b02c313bdc66b00ed31458545b3a7e04e5c18f566c623214c8683b512671ef3bf63405a585a126e6510f0c9131ecae5eede01254b7799e6d30034bf4f', '619d2827a9168a9a079ccab7d15b2d2c', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:35:47', '2026-10-20 08:35:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-ddc024ae', 'reader_1792485347369@devharbour.in', 'reader_347369', 'Avid Reader', 'eba8314435fcc1412b89492e8ffae7a230aa3f3c611a91430f965a699bdd620c8e579b08f7e44b5b35e876a800686682feb8df206545fad0cbd7e1f06f3e964f', '170b6cf880dc067eba476159795687a7', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:35:47', '2026-10-20 08:35:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-24979f7f', 'coder_1792485350624@devharbour.in', 'coder_350624', 'Code Challenger', '60e051bdcdab08349a02db858cdca794e8afeb3b0f708d981f8a37adec740eb686978bf12d89040c2a5c1f43bff66c0d32f3a2d8fbcbb833a492a6f938099b0c', 'a722d9f05790808711622e1107279017', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:35:50', '2026-10-20 08:35:50', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-b80e1d3e', 'builder_1792485350834@devharbour.in', 'build_350834', 'Project Builder', '95d9b2a12126855224dd4985d004efe5599463dfe0dca6fb5fc2cc76f0b6d13ae3a00819bc92c607b2574fa25445188413e146726592970438c614dce1c05652', 'c4381cc03a5c7efa09d32e77bbfe0293', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:35:50', '2026-10-20 08:35:50', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-f5b1f256', 'intruder_1792485351021@devharbour.in', 'intrude_351021', 'Other User', 'c6a537d45454a21a6116684c2275703c4f6a0c61d524295edb8040c10608abb61b37f03f6f1db386b00711e6ebd3fb4c5292614541320c7dfa8e308365a2d7b2', 'f46318c9e66c173514337c463caa3437', 'student', '', '', '', '', 0, NULL, '2026-10-20 08:35:51', '2026-10-20 08:35:51', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-e73bcd7d', 'settings_1792485351163@devharbour.in', 'set_351163', 'Settings User', '2f095e85d4ac86e782658890bf3e51e3a9ec4e12e8c96466a565e12c6bf66c2d329d14ed436c38c7055dd263fba32d76d27cf2601e2a1d1c5a0d6c9a6e57efec', '387c627f38ebb7a7036be928d75124f3', 'student', '', '', '', '', 0, NULL, '2026-10-20 08:35:51', '2026-10-20 08:35:51', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-19c63d83', 'student_1792485575072@devharbour.in', 'dev_575072', 'Test Developer', '0d6d97e41b0363c288a2acfab5752f8b1e4bd095299f6daf183f6ab031adafcf93c45fb69d88d326b408f135e2b04e9c1144f178172abde3c4fc2bf79340b45b', '4315351c6c74efd0d0e4254b78c79798', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:39:35', '2026-10-20 08:39:35', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-0eac25e4', 'reader_1792485575599@devharbour.in', 'reader_575599', 'Avid Reader', '6f29b5152cecfd549117f892e6af5140d9db87fe4ac815c1513ecc1836ea42feea278453fd139c2f06d873f0fa64b5697db2f311e1d1ed0a630ac54306bebd86', '6a48831d1deaeaed7ddb6281ab188956', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:39:35', '2026-10-20 08:39:35', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-aba7424c', 'coder_1792485578980@devharbour.in', 'coder_578980', 'Code Challenger', 'da3d59bfc852e62be90811ee2e62b1d3b9bbee99458678d225c4cfa81de1d9de558763a088225fb4862403ebbdb246c92ae11f0e2cb6ab62384dd491cf2b50ef', '3223d3694c7af2acb0754d050ea0dd2b', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:39:39', '2026-10-20 08:39:39', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-225952dc', 'builder_1792485579202@devharbour.in', 'build_579202', 'Project Builder', '2b64e917559f0381a2763e401d7f373b11f1cfa7fff9a6d963a0c549746fd7808b0945709d90adf4bce153e6266871e1439c131978f5b320280d1404d2aa9125', 'df59f98234e3114fa25da907e9790747', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 08:39:39', '2026-10-20 08:39:39', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-e9fed580', 'intruder_1792485579466@devharbour.in', 'intrude_579466', 'Other User', 'f3f76e34c195fe236ca8681e09ee6ba3cea28547a9112c7956697f546a6d2b2204421019e2ca3b13ad644a49bdd8cf26afe4b464c472125014f48780db88e08b', 'a7eeb6dae5a4eb19456c6adcb078d487', 'student', '', '', '', '', 0, NULL, '2026-10-20 08:39:39', '2026-10-20 08:39:39', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-3db9f967', 'settings_1792485579670@devharbour.in', 'set_579670', 'Settings User', 'b353b51e5e9f48dd2a83958a01f8d3086baa63c4786bb79bfab444e2f177c6bcde037802e597e4721cb8bb0b326eafc38f231e478784a24d0b6e569519e7290b', 'd88d5026165bdfbff74fa309d39bb831', 'student', '', '', '', '', 0, NULL, '2026-10-20 08:39:39', '2026-10-20 08:39:39', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-0571a769', 'student_1792486820459@devharbour.in', 'dev_820459', 'Test Developer', '28a1346d378e37c5c5aebcbe472fadc93a96051379e0def08411eed4c217f51c8f8797154f7fb48ad591ffa5b89c5b990dddfb01cd1c8381c95e957308e0a918', 'c54bf25184f587cda68cb814b8fec606', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:00:20', '2026-10-20 09:00:20', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-128e7287', 'reader_1792486820965@devharbour.in', 'reader_820965', 'Avid Reader', '09f7d0d48874626fd57d86500342f669591efe336a67de3df90ff567b9c59df479dd9ed9199cb4605fecdc570e43a4568a8ad7be5bb7915b2664ab2a51b8b6ea', '57a9bbbab58ad14b12113a25dc277eba', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:00:21', '2026-10-20 09:00:21', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-2787ac99', 'coder_1792486824250@devharbour.in', 'coder_824250', 'Code Challenger', 'ffffdfbd1b9981162f9da155b8ba17a66b8219c0eb6179103e219c455b03df3e5d7133570d3c457e9aa1efeb51ec4a7da6a6c3852ea714d85728c1f30081c380', '46495b8b1970420e0cd3f8e50920f5bd', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:00:24', '2026-10-20 09:00:24', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-e05e9cb2', 'builder_1792486824473@devharbour.in', 'build_824473', 'Project Builder', '0780e3a6a1394d24881267a97de3ac452ecf0dbf625fb739394ec866231292990a5985e2745e8b94049e03a74f32d197d4f70ebe31da4f4f2b8194824d906199', '854246504358dcf03eedfda3950f1d43', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:00:24', '2026-10-20 09:00:24', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-3f6c82c2', 'intruder_1792486824721@devharbour.in', 'intrude_824721', 'Other User', '020aade4727ed6fa347af4fcec421588c80b6bf94beec032427035be12c10c8ab8d010279a3711a14c840e12eb63af0f942a3b7921c45fd3e0facdb428345f84', '900a81e182f6a9d44544d0a70b916f2c', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:00:24', '2026-10-20 09:00:24', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-ac4c64ab', 'settings_1792486824907@devharbour.in', 'set_824907', 'Settings User', '1f09ff83f54c4123a25cdb1536c654c55a5ca6e16dbf3aff73b08f5b422bde5d8e8bc7407eb12b985e26ec92021479e968369963ec764abc4e68fa74208a5f36', '8174427b1a681f68cfcc0f92169de9e0', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:00:25', '2026-10-20 09:00:25', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-71f7ca3f', 'student_1792487383316@devharbour.in', 'dev_383316', 'Test Developer', 'aad7920620514d18472042f00b5ecbe94189c10472765e1c1689733ff9fb40748336902333fcc638b955d902088c2048ddde4ecc8e487e3b6f84d889a0cfb3f7', 'e668051b107e395bcdd6dafa3a67fa20', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:09:43', '2026-10-20 09:09:43', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-731014a9', 'reader_1792487383885@devharbour.in', 'reader_383885', 'Avid Reader', '7d9ad9a8039091a8c531f845423606f588e3299d58a891811cb0511138e3364c286afbbffffdc0ec827f41b1ee4c4abc50c23f08181bb39b78c16814d87d5cbc', 'f115f328bced029079529b58ae889ae3', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:09:44', '2026-10-20 09:09:44', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-5c994333', 'coder_1792487387173@devharbour.in', 'coder_387173', 'Code Challenger', '53a7cb5bf54afe7677c5a6bf97958abb8c8fec11aca38052ad28eb768217cc5e6912cb5a34f06a8fc21a50b91a79ab4319410614ce51cb2209fdf952bda7b6a5', '1ef9a564edeef91cbe5116149d367365', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:09:47', '2026-10-20 09:09:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-f8cdaf01', 'builder_1792487387346@devharbour.in', 'build_387346', 'Project Builder', '9a43e026b2a469bf5ea0e4a880f88d234eb2837c2fbeabbaccc4691cba1d7c5a54dd578ad3c1f3b4146021afba21031abf9af7c24e6f764cc41d0d0555bbc829', 'da49986fb58cb7263991b9361bdf5dbf', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:09:47', '2026-10-20 09:09:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-217811e7', 'intruder_1792487387511@devharbour.in', 'intrude_387511', 'Other User', '52569dcda5f6283ac6295736810f91bafc3c710719a84228c954b1490bf07d1fb3c7edf65dfb1763ff039ad43d1f501beccb4edc481424576f49ff18e4289d0c', '48488dd7af3614797d97f185c53fc100', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:09:47', '2026-10-20 09:09:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-9062c2ca', 'settings_1792487387647@devharbour.in', 'set_387647', 'Settings User', '8ab5eb70a1c218e2725e5677dbc6787ed835f9a14e0d283441c10045c05c5fc81a71d1ae982036c85df32befa17509474e204d4d65248f2d8dfd47ae9b4ab764', 'c4dc3ee3eb29e66238203f8025ae31c5', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:09:47', '2026-10-20 09:09:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-7bf07c58', 'student_1792487422026@devharbour.in', 'dev_422026', 'Test Developer', 'f144483a996ef7bdbb297506e046c7f7aa6d0c36f9be15a664024be256f3c0baa4e1301183902fb880edf1aca48c14e4b755764016904fc5abcb1f20e1eb45f6', '84390300f20859e36cb2f0ad643783dc', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:10:22', '2026-10-20 09:10:22', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-24a19883', 'reader_1792487422335@devharbour.in', 'reader_422335', 'Avid Reader', 'f832bf52feb9a62eabe7b4c0ef79a700947ce50dad58793d557209c93260e3f1fd1ecc0f90b5c2dc3e2e2da245ac3e25f62bebb73b9fc42c22ac651d1cfe286d', '449328e9fb08ce7fea04f688805704dc', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:10:22', '2026-10-20 09:10:22', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-8253842d', 'coder_1792487425515@devharbour.in', 'coder_425515', 'Code Challenger', 'a144077c44f279a854558571cab88dc26143ecf66ba8816220f421d78859fb6b3938d3f2cb34f44893136fc7aaba306b0e700c69d1480242fd57552f7262c065', '34f55d666d189b845a319c022f0e5152', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:10:25', '2026-10-20 09:10:25', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-4acb5d2a', 'builder_1792487425691@devharbour.in', 'build_425691', 'Project Builder', 'a107af6e4d11b3a8440d6d3c5b36c75f17a61d4efae8008314b6ce37fe7df85fc3e2ecea7faf6717b6ef4a25d92225a2a04c59a243a96f62338ed6c1b5a09360', '73a8ecd8f86cbd2a9d04e6291314e6ca', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:10:25', '2026-10-20 09:10:25', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-7ad9df0c', 'intruder_1792487425846@devharbour.in', 'intrude_425846', 'Other User', 'b0566ac8de89f12ab24fcb32da1a4e7c3135138dec58ca4b136d174a7e1d3c5469e72f8530ff7ba6372fe67b7b02e653340ee351c44a00406c729f9794b8f891', '3747689fec9ee452b05ccbeb81aa7b27', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:10:25', '2026-10-20 09:10:25', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-3b8294d3', 'settings_1792487425990@devharbour.in', 'set_425990', 'Settings User', 'bbf12d605b4b9c25a2bd0a537e7f04fba0c7af497d83ba6509fd51d8e46b793f8846ffc47f1a5730e5132c8808a7394ab8a0692e0294b19caf1bb35cbfee4344', '46e6dfcacd816ddb2bffc546aaf5c386', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:10:26', '2026-10-20 09:10:26', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-c05564e9', 'student_1792487529252@devharbour.in', 'dev_529252', 'Test Developer', 'ff226472e1cdcdc1be83d4636ea95a4cf4f6a2d6bceccbe7a124a0987df3a77231e9b7cdb631975a22122da1aa2dfb98592fab782bfd09d8b4d52ea1842a2498', '71ffd7025679e1c67d3b4904253dec9b', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:12:09', '2026-10-20 09:12:09', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-eba1faa1', 'reader_1792487529572@devharbour.in', 'reader_529572', 'Avid Reader', '2a44c598c2026e20040f4640c913c61d61559b539836ea576916a5cacf734fbec5fe347654ae9c98975186147fa5d0d1f5c21460c0ee7ddce0240ba5a9ace53a', '3476e48718610e96058ab4c336a27b10', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:12:09', '2026-10-20 09:12:09', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-6a70d6e6', 'coder_1792487532761@devharbour.in', 'coder_532761', 'Code Challenger', '3dfb8a6899ff3446116e69f6f2c0502d7ab77329ef4c499db6f52f7808e3d22800521b5930db04011cb113415bb5fa788505ff9a5f82ef60e0d88e449597037b', '8200ec5e9c984590faa1f6e9e9b6ff9b', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:12:12', '2026-10-20 09:12:12', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-56cef437', 'builder_1792487533003@devharbour.in', 'build_533003', 'Project Builder', '65a0fafdfd19b09e8c185446d668220dd8f7b1d28be8940f565ddd6602936849898ca664c2c3c8c9a369fe1c1940d3b93d3a22ed19d4d7caf35bb0fac29dc98b', 'c8e59a49bb066892f45e54dd018f354b', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:12:13', '2026-10-20 09:12:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-99fbb25c', 'intruder_1792487533226@devharbour.in', 'intrude_533226', 'Other User', '365504e9556a648aaae7862d1ada20bde39a6b7f76ab02e36a24b1bc9b27649150c5c5f4eb3f1aa2d70e45c0de33f0c5b77c667ffb52a8629c956ba86a9427ee', 'e0a6d527ad96b0818561a3b33889d67b', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:12:13', '2026-10-20 09:12:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-ead70c14', 'settings_1792487533365@devharbour.in', 'set_533365', 'Settings User', '667232afced31450b4481346aa4d8ad866631577635021db5036d98e4258bb5af1d157331e4a326f5109b68db28668978b77a7c96b8379632c95598b5f343447', '1f14f8af3cc756d08c0b7f2ae9c7798e', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:12:13', '2026-10-20 09:12:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-201dcaa8', 'realtime_tester@devharbour.in', 'realtime_dev', 'Realtime Tester', '2605eb7400ca242c424b0d7460afb65d0d9d914ce73d169b327c822c238f71a03480957a2e482652c3e74e3d450f7668b381f9c1473f592a525e7dfc0283c524', '4f63e0401dece8c46b035c2f2d5167e0', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:13:18', '2026-10-20 09:13:18', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-57b405f8', 'student_1792488047075@devharbour.in', 'dev_047075', 'Test Developer', '55fab43086082a806b2522d729ff7c52f15048a130b141b370648d37b01a01b196e436031b080808922670f1a1dd84e3d85922ab475dabd77b9191901b511dca', '0c2026d601a4436935b375a630ac1dcb', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:20:47', '2026-10-20 09:20:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-a29aa3a0', 'reader_1792488047425@devharbour.in', 'reader_047425', 'Avid Reader', '99e9e55097091d73986a66011cdb8ab5604f7806c882422c9a8b28a76285f9a53599bd0d756d4727af6867a1bd8ff9c39e6ee75c14040347be725c5e3c9f1b34', '7e0c69eb805da7084f147dd4c6da16eb', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:20:47', '2026-10-20 09:20:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-a6e8eb39', 'coder_1792488050645@devharbour.in', 'coder_050645', 'Code Challenger', '124f9032d4bf4ebf19fed49e73cd05b7a481e14235d39637867da522eab27d37a3540086c0241267f73f643ac2fa2ca76c637d45609253f7f31e264acf29c548', '21896dd8d0111b9c794e36d6cea9e1c2', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:20:50', '2026-10-20 09:20:50', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-737926e9', 'builder_1792488050849@devharbour.in', 'build_050849', 'Project Builder', '10e8d2cea9a649bf2355f44d47865ce3318bfc09464d7f70625ca90d5217d7c5fc5e152d961c6c3fb4c357f1e7fdebd85f2b21f19cac8dd9a13af8eb69671e62', 'e980150e809d39932ddf50232402b45d', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:20:50', '2026-10-20 09:20:50', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-873c4bb1', 'intruder_1792488051056@devharbour.in', 'intrude_051056', 'Other User', 'ac189140b119249acd73222deb638011436a52e09215a82e81d29beb0127fe53a98e19d8bcab707076bbcd34ecf2ea34ea526fdadcd127b35a781d47193f7078', '535640fe87ef6ab47045d984dcacafc5', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:20:51', '2026-10-20 09:20:51', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-8246f8eb', 'settings_1792488051199@devharbour.in', 'set_051199', 'Settings User', '3e49f8923df6c24f635c77e3751af775ab2749360bbb63a869399163d66dc674abb0d5ac642fe06996d8accd578f67e2f86c957f4093fd16dd0067d83d0ebd26', 'c27d130dbe02bceabd61600fd76c366b', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:20:51', '2026-10-20 09:20:51', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-480ade78', 'student_1792489303623@devharbour.in', 'dev_303623', 'Test Developer', '20168cf076da0b13d25bc45ee18c90c7dbcb1863f8f2edee0a51a987851854368dffa9dd7743077e2a8306e10c834a5cc61d09358040cdd4778544584fd7a4d7', 'ca85ecc0b9785e2d48162b18bec7b620', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:41:43', '2026-10-20 09:41:43', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-b7501abc', 'reader_1792489303897@devharbour.in', 'reader_303897', 'Avid Reader', '7651f52bed2c1f047a6275f8670cc1483ed23c9c31cf5cffb504aadccadac81bf5f7aeabeb293ce9d30e8baddeffad66967d3aacca086a89be5d1e3c0b97b3b0', 'bd17ad9a76b103a744e6a8fb18156f49', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:41:44', '2026-10-20 09:41:44', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-524e0b5a', 'coder_1792489307058@devharbour.in', 'coder_307058', 'Code Challenger', 'dd6df963df6c8d6d1d3d2c4d28d1fdf242657e0211d3792df6977bb4f8bc4f9ddda2d2f1b9c728b00836865283b3a8c97ceda206295ed5d2a63d5bb1deae1f49', '1b83917e1198fbd7d820ab31c0dca2fc', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:41:47', '2026-10-20 09:41:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-e155cfd0', 'builder_1792489307246@devharbour.in', 'build_307246', 'Project Builder', '63bf362a2191f3481d603e463e2e102eca9fdf6be556d401df0b669464ef639f4018abea98707036b74b9935d936740aac68b33045af2711952bbf178f9befe9', '7285b66205dc71d66aea40693c813c64', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:41:47', '2026-10-20 09:41:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-56826960', 'intruder_1792489307404@devharbour.in', 'intrude_307404', 'Other User', '41bee90023e63c8b49e412755852ae5906aac5856c267bce21e678915368b67c29dcb77edc6fe2286e6028a92b204569e36ac4d09fa131fbaa8e890f0b1e8bfe', 'b7d52cac3e4044b0d0edb2e70fb75063', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:41:47', '2026-10-20 09:41:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-0e4bac5c', 'settings_1792489307548@devharbour.in', 'set_307548', 'Settings User', '9491e23fe13a1a55e8ddb914ce9f518a8e2c1069aad8a20e3ea6a067fb3ecaaf795a607e2855a96b5d6f4afc08e14cba2603b9b7ea154a2a7dae17835c71f063', '808211a5219a7e5fb4227bd9605ff341', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:41:47', '2026-10-20 09:41:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-de0e71f1', 'student_1792490349079@devharbour.in', 'dev_349079', 'Test Developer', '32b3b4fe3b874fbfdc5eb823b89f17a2cf20e4edffb97731e807a55a8eeb11f55e82095f0c7d38ae694aa38658afe296dbdcc4e288a1a0b97b2151b0f5f7178f', '300a79fbf03377e656d3e97f6d791862', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:59:09', '2026-10-20 09:59:09', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-596f2a7a', 'reader_1792490349856@devharbour.in', 'reader_349856', 'Avid Reader', 'b22a10acfaf7263a2148fc5b257039c3da14cf0cd6f320cf3aca141cede238d8cf581a52f7fd8c4e03f98f5a7e8a2779fafde5a0b28da378a11e3dee53196e6e', 'db25a3ed0df5ff5671f47b011298834c', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:59:09', '2026-10-20 09:59:09', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-c3e1f6b5', 'coder_1792490353061@devharbour.in', 'coder_353061', 'Code Challenger', '750a5d07130e977b396f39da20195b85ffa1ce7f27f4e6278a0b68f06f4ca076811a406e4496b839e75894c5ec3f214f35b4883b75a3ee363e53e667ea603276', '46ffb9d25e0e84207200b684289c60fe', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:59:13', '2026-10-20 09:59:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-1da263d4', 'builder_1792490353387@devharbour.in', 'build_353387', 'Project Builder', 'd588fdaa8d426d5202d119c2236170520c4aa75c69056bdd7f0dd7f3d3ad7e5b09f736b9ec05449795db9bf2e5720b8d69e250e063e0822ab4a45351beb53a29', 'aa938a4ef4464b85e56463565c2212fe', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 09:59:13', '2026-10-20 09:59:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-12b9f115', 'intruder_1792490353614@devharbour.in', 'intrude_353614', 'Other User', '73d93fbad1e9019519109fe7278a50bd63ebfdb7e7ac50426225d056c3497593a09a2aa3c3d884d1fd29ce709e7f6532c2fd555e46b3cc4781aba6b68864c023', 'e00e29540fd26ecebe986fb566d80981', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:59:13', '2026-10-20 09:59:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-9965bf7d', 'settings_1792490353769@devharbour.in', 'set_353769', 'Settings User', 'a93c84f4fc748836e4ae7d33d42d04cc2a6e7ae43f2f87fe9b68792131741e2302ee16d232579a0aff5d3c94f7265abc7b2c3db673512d468393b839cfdb60cc', '41fda31028e2aea8818667adc081fa9c', 'student', '', '', '', '', 0, NULL, '2026-10-20 09:59:13', '2026-10-20 09:59:13', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-f827db95', 'student_1792490414038@devharbour.in', 'dev_414038', 'Test Developer', '04036aeced352a49b4bf9b2cd62587ea83a6e2cf7768ff5de146f3c2d890a43374aae16aba75f25f18cbe763e1a8269b969a6ed390379da17c630e71cc384b71', '0572c95e917b9fc0a70b116fd7f2b9b6', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:00:14', '2026-10-20 10:00:14', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-ce837f2b', 'reader_1792490414331@devharbour.in', 'reader_414331', 'Avid Reader', 'e1801c7c69349d25e59f4cf5d94d72489df27bcd00996fd4fdca06df6e21b739376b1583c4aac2c5272086075e58f3ebc8f3b472c77fbbd8ec33fa827179f8fd', 'ee60e1a4bfcfd77c6c47dd812a09557d', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:00:14', '2026-10-20 10:00:14', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-c419646d', 'coder_1792490417531@devharbour.in', 'coder_417531', 'Code Challenger', '386c3eace1c546a8ae79f10bd556e2b311948184cec3ce821eca80d98bb24bed93a71710917ce0e0a9e4188aece333573de228a99926c5cdb02ae1b1d3aa3859', '8fe94901b93ecce81b080054afc906be', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:00:17', '2026-10-20 10:00:17', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-3a068fd1', 'builder_1792490417761@devharbour.in', 'build_417761', 'Project Builder', 'cd64993849118ae1842c80dbad1e0252b60d70810f2ea58eafd4dae93b648f64d85b4089923887f3b34763d522edf759d9546a71949064bb772ce97d634fc636', '9353d140ecafaac25bc4c1b87176e9fb', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:00:17', '2026-10-20 10:00:17', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-f8e9b589', 'intruder_1792490418025@devharbour.in', 'intrude_418025', 'Other User', '3bb136710ac0ea75d3d56cca256d04e3eb806db08745615c095cf6a1bc982c3155981d022e595039359890430cd4c09b5bc48f3202c7a342838d5237b6c1a956', '9897dafc5adb4b096313d2305a4273ac', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:00:18', '2026-10-20 10:00:18', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-bf5b0b28', 'settings_1792490418179@devharbour.in', 'set_418179', 'Settings User', '705049f889ed24a6f7712f2cfae2e77a4e1fc2b159c349344ca47bb0421b0179397c14070644c2ef07f8cd3c07b5308518c2108a7cc8bfdd0a43ed1520f95a63', '4f94a4586a23680a1aef47819414e3bb', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:00:18', '2026-10-20 10:00:18', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-100b21d5', 'student_1792491870382@devharbour.in', 'dev_870382', 'Test Developer', '0c103e8fb4303935109c5eb830fcae04ad5beb06c0b348ff7ea381410ce6d2de79876ff8599edb5a7b2491d490a438d74f9e353b494783d13218bf03add5e6a7', '35c802ffed61846ab317dfb9620baa94', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:24:30', '2026-10-20 10:24:30', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-3291f84a', 'reader_1792491870730@devharbour.in', 'reader_870730', 'Avid Reader', '1ba69496536d976990c5924a37aabee53b20c9d808d309bd99f6e783a426d6402861ee920a16503d8f57494570dd7b3f2ae79310be348d0461599b19865bda40', 'fc8f07d89115231e8a0a58fee552ffd9', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:24:30', '2026-10-20 10:24:30', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-481e6138', 'coder_1792491873902@devharbour.in', 'coder_873902', 'Code Challenger', 'b0d9d5fd23615cdd6ce5e40c311f7a56bcea76aaf3e7d7860742f3201db7c2a8beab03f6f448eb9e4c34ffab43d7c0160383aac67aafc70b8dd136ff8d8c7d8d', '17aee2dd0e30890e8986d7708f96c27a', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:24:34', '2026-10-20 10:24:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-07a0383c', 'builder_1792491874078@devharbour.in', 'build_874078', 'Project Builder', 'd37ebe605076ed7ac7c7fe2c84fe8bdf64d97e3b6d2a3a44c4e2d86d208399d71b65dafccfb9a24a43816f33f7d8ca58a0e1c1d8f746d6c1255475d5316e6e28', '8d3aa1de544b56e5c4e21e6dab249322', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:24:34', '2026-10-20 10:24:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-851e573b', 'intruder_1792491874267@devharbour.in', 'intrude_874267', 'Other User', 'bd7e512b72691cead1e0d8202d8ced29876d92f176146fb58771d1e2b3b7da038f0fffe90ef6d48ef29fc3df3b671bd51015fc7df1bb7857f941638af793bb18', '9fd3109228982af2b634c3cdcad78672', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:24:34', '2026-10-20 10:24:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-98b34dbc', 'settings_1792491874448@devharbour.in', 'set_874448', 'Settings User', '4bddfa6b827fea2a7026fe476bf3dd298e928c3785eaed13f371d72171b605e5bd9ecaad46093ffed0c5ec7e03131592ad2b50512c58ac68a795ad0a2ede3fd6', '698c44a545eebfbbb08779897143460d', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:24:34', '2026-10-20 10:24:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-a5ce8755', 'student_1792491955266@devharbour.in', 'dev_955266', 'Test Developer', '353721147a133c0834cc6f99ae60e88e9b3746d1c90e534a52dc834c4d28dc2bf85dcebf93a76506377d684cb0e13a83a243b77d1c002b8cb77c937f92600465', '46e107d88ee799b6117966644b01a7e9', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:25:55', '2026-10-20 10:25:55', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-a37255bb', 'reader_1792491955609@devharbour.in', 'reader_955609', 'Avid Reader', '75125d26e18d519d07335adbf1f061bedb43698e66e1714e7caafb34527f500ca34f5c5fd6c896ab404bc8f1a9063727da5f019a8a6ef138206189c12de81b67', '98af585b22778e164abb43df437c1173', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:25:55', '2026-10-20 10:25:55', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-6628001f', 'coder_1792491958808@devharbour.in', 'coder_958808', 'Code Challenger', '9663eb0e1ca50e78541bc4f337ea9042d0e349f31167714d484af59d059d986923c00425889a74348f724849a26a80f804120e67e86c0293c38f4a7d252ca0ae', '5604524efe0293eb863747bc92ad8e2a', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:25:58', '2026-10-20 10:25:58', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-2c868f8c', 'builder_1792491958982@devharbour.in', 'build_958982', 'Project Builder', 'ba822517057d6a653f67fb069f6e62c21b4097f40709d06d840649e9f223841fe162bc23c33919f47901656553a80eda30a3511a4f71ab9eb7a7059363d39cd7', '8fc02fb75772d3bf81ea733d68d14f7c', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:25:59', '2026-10-20 10:25:59', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-abc1a9fa', 'intruder_1792491959184@devharbour.in', 'intrude_959184', 'Other User', 'aaa75d83739256ae384ee54a69a17f56a0f551fe33ea5390fae23ba9c8de8b37e4b5783099e170b99f2346bd05631d5d7279a30c0b23101b78b467daeef31e39', '1c0c67e9209ea7db41337b327553fffc', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:25:59', '2026-10-20 10:25:59', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-214d5a75', 'settings_1792491959327@devharbour.in', 'set_959327', 'Settings User', '55c85f053094192037c64690652263863b13c25e0e0b496c878711468d6bbc00cff86fa2fb53ebc1e502b927c70c5a4e89180df4b75f2a28d14409878e5740da', '7ac5f2a0ed84d7ce6a455361d35d506d', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:25:59', '2026-10-20 10:25:59', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-7c7ec8ff', 'student_1792492286203@devharbour.in', 'dev_286205', 'Test Developer', '0b88a85b9cffc20fe1be7d8356debcfe66923c8aa70189b7271c7189c91a80e9bfdbf32ad7cd147048ece220f9199f966057fcb0eec33909799270f1e8c47501', 'e097151a69307e1a4d6bd03fe4561417', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:31:26', '2026-10-20 10:31:26', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-92c4d906', 'reader_1792492286627@devharbour.in', 'reader_286627', 'Avid Reader', 'b8242d22cd3ab16204ff796ed89266a1d0fda9bf68ba7b7823d86d866eb8ec089bf8ddcefb8ea06d1c5fe347f47ba9a715be9f01f3f8d2d049ffe8eef027eac7', 'fa3d0cdc359729e3db5dd5eb86eb4847', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:31:26', '2026-10-20 10:31:26', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-5dc98264', 'coder_1792492289847@devharbour.in', 'coder_289847', 'Code Challenger', '9878f7db3aa5575cc121725525fe097e40cd56a973f5fcdda23299bd0eaba6b8c914c1997bd1a9499321c2e9ac1b741ef2061a2ef80ae8838432e36161898dd1', '123e04a171b67ad21fc89ada2b53c121', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:31:29', '2026-10-20 10:31:29', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-502ad689', 'builder_1792492290047@devharbour.in', 'build_290047', 'Project Builder', '00c3a94419e95f3ccc2dfa4886b37b7054a7b63fb556b1b76f33096bbadc6be7684d12160f3f35a5cb82fbd5dc402f67aaccf0bd1f320776864c92180fdac0b6', 'a5d2665c1800b50f0040f4fbcadc563d', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:31:30', '2026-10-20 10:31:30', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-217cc732', 'intruder_1792492290249@devharbour.in', 'intrude_290249', 'Other User', '67c2f8e79ec12874f1e64baf400058f2a2bc7f40103e4d4b5c0d0e73b6813c30b30935c4829425e94e46452f52d82afd103e431f6716b02e3373969c122a66cd', '2dad354d4c297440494342469ae59f64', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:31:30', '2026-10-20 10:31:30', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-ac677635', 'settings_1792492290364@devharbour.in', 'set_290364', 'Settings User', '1a8d6e03a26bb4fa400fdb9745408411dba76ab9248676edb46bec3d7936abc4899f4a9c6b23e03f8f23f5ca4e5e5022be562f133ca1321b7930fec9050c2aeb', 'c5879f4c1f1a7da1a760f4e087b8b35c', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:31:30', '2026-10-20 10:31:30', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-85f588cc', 'student_1792492871665@devharbour.in', 'dev_871665', 'Test Developer', '59f55cb71e6429788679da19fb3688c6ee509824f37cb6b27ebac98a7d55b4cb4b1cfde508d48409b824a831982392dfc9a150e7f85fcf5f41d057bc5ed22556', '3aa907177faca49c7ef43f14434aa842', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:41:11', '2026-10-20 10:41:11', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-8903a3f8', 'reader_1792492872229@devharbour.in', 'reader_872229', 'Avid Reader', '1e4c3d48390a28d7cea0544fa385032ba955fddeee7358bbbebab60b5506b2c3c8e0cff1107d0005a3b11d95365afbd661a976b820f29ea48942ce15c6c8844a', '95d55d523b885d1666005674ea2bc44c', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:41:12', '2026-10-20 10:41:12', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-68c022ec', 'coder_1792492875529@devharbour.in', 'coder_875529', 'Code Challenger', '9cc4fde282825caf933ad23044db44133f446f8ff3454c473a15a5fa9ce989bc094a10a5ad7345a7c69826b10732ab45c2f3beb91a07fd39371360243ddc20a7', 'd1130a0439bcc05cfe02ca7639c70d68', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:41:15', '2026-10-20 10:41:15', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-dd4e2eee', 'builder_1792492875836@devharbour.in', 'build_875836', 'Project Builder', '8bfd31bb684a93f1ae224f517923334d0492808794abb7cfd67e621ecd7fc714fed44c6a734247c9e83733cc42f4631b3055907e02e22e18fbc3df7f2e9c4b90', 'e7a640c8c9b151f8bf0144a2e30236d1', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:41:16', '2026-10-20 10:41:16', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-69aead88', 'intruder_1792492876152@devharbour.in', 'intrude_876152', 'Other User', '9204c100484e20ab6a29a9151159fc675693fdc19e28b34be0df5b0ac865d56c757c402a66fa3bf4be1c9ce9f4cd8eeffe28c0daddc4016d31c5a556823fffaf', '861f5c870d0572fb5308311fba8ebb73', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:41:16', '2026-10-20 10:41:16', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-7b9f67d7', 'settings_1792492876384@devharbour.in', 'set_876384', 'Settings User', 'e1f62b6fe0ff420700666eb7483290a6ad2db19428b91118e23f082a47b9e2f932e3459ba08f83783943778f6dbf97a1cdcd215d6a630d6c72ad82c55dfc8a0a', '4a757b2ee630f7dbf6645ca32d411b47', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:41:16', '2026-10-20 10:41:16', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-d31446d7', 'student_1792493086764@devharbour.in', 'dev_086764', 'Test Developer', '55f663afaa8646f0247167ced97e1a9598fffefb3c5915e90cffd71c3c5e0799d4a6a65597483d9c3a37acf30d28997dba71c3ac83155441c0b0284dd0a179f2', 'ecf91cd036a194c09188833c2601c2b6', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:44:47', '2026-10-20 10:44:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-d7c89a66', 'reader_1792493087518@devharbour.in', 'reader_087518', 'Avid Reader', 'b4000c37727c0bf2d61d4bc1c55117023dcb6447431abf2a89e1c77dbdc4731e89298fc05a354738435ffc43743aaa5d24ac83c9e3dd65f17749d7a8cffc4899', 'f882047c620787e97d40d18264ab1758', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:44:47', '2026-10-20 10:44:47', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-334b1c53', 'coder_1792493091235@devharbour.in', 'coder_091235', 'Code Challenger', 'f0de9ac04f47e448b867b5d217c5923dcd8ba74948ad0cf8792ed837d930647be10187212d7e2bbe8edebf1c94d877546aaec33d4ce4ea5b2faace6d59af605f', '7cf2ec65a18cd058d59d12f82efb15c8', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:44:51', '2026-10-20 10:44:51', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-2a08125c', 'builder_1792493091701@devharbour.in', 'build_091701', 'Project Builder', '4d061ce176786ccf242e8ce2336d2cb47d0cb0d6f3a53ed5c459e5ccd943b5c226e51d57a098c2d7dcd55ca12f827692b87a44648b4719191f386c6ed361af72', 'cdb96d9a97e3870b5552b0bb877d7bf0', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:44:51', '2026-10-20 10:44:51', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-53c1a5e9', 'intruder_1792493091948@devharbour.in', 'intrude_091948', 'Other User', '7c643661868003c6303e816b0f98c650d9a0a99556afa2d7fc168c7c3f0f8840a6686465112b1be0a6598aac461f12e800b717bf4a3c05c167db961b88c06fc9', '5096950e6226e91adb0c84d4948dff9c', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:44:52', '2026-10-20 10:44:52', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-64ce7ecd', 'settings_1792493092233@devharbour.in', 'set_092233', 'Settings User', '0ced378fd32e14a8bea1386ce8ae7183973ebc7c0e9a96fa5e3d04c621f9fadc3a9fb66f07f30df417eaaa57fb487a67ef084ebc7d088631a1dfa766c82f01ff', 'b9d8c81a6edebcf6f39bce5d41070909', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:44:52', '2026-10-20 10:44:52', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-931a5f2c', 'student_1792493355275@devharbour.in', 'dev_355275', 'Test Developer', 'cbb19e8bd1dafd5d2d66a69747eb6b69f3cd043f43967696c02295165f79e01d9dcde487ed0d496dae1efda283d6950177ba621dd51868c68631b45e00a37623', 'e4c0f95f85300304ec4260d100a9443a', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:49:15', '2026-10-20 10:49:15', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-9d24b4a4', 'reader_1792493356017@devharbour.in', 'reader_356017', 'Avid Reader', 'aadfa457105188a0e972aba7067487b77cc1871429a8e3e83599fce465a2f9598914730612c859c25a79586a3f3060d18649fd5cf4f95056469ddaef2dbf8651', '1175f488bc0fa511ec4b867bf35609b0', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:49:16', '2026-10-20 10:49:16', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-b722fdc1', 'coder_1792493359463@devharbour.in', 'coder_359463', 'Code Challenger', 'efd2eb843c4eed48c075079af7ced88a6f8e0bf5b88fa2831b6238288dcca80d89449e9c27ad519ad3ccdc426901c15cfc45e50c7d908f7d7927124fdc25ce2b', '11aed49ff92e2e9c84ffd7c2fbbde0e0', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:49:19', '2026-10-20 10:49:19', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-9abf4eb1', 'builder_1792493359764@devharbour.in', 'build_359764', 'Project Builder', '51a0e04cf003665339566336240b1afac6b325413c132e030e06281143f37cd6a52723d069416a5e78acc2c40070bed722abc7f1a92421efe024556da8824584', '1bfac0008abc3093797de8bb7de315bc', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 10:49:19', '2026-10-20 10:49:19', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-c1a3ff6a', 'intruder_1792493360024@devharbour.in', 'intrude_360024', 'Other User', 'f19ccc2f5f6041900f0310c68a1d5251295ccfb529693cde5cefaeb794afd339c7344e757f2f9566e0427f860b1b6efa116ade16f8e374320ef89ffcaac8984a', '8de7e6454aae72ed863e132db77d18cb', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:49:20', '2026-10-20 10:49:20', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-80111700', 'settings_1792493360219@devharbour.in', 'set_360219', 'Settings User', 'cfdc615caaa55f2c9bba608f8a0370ffa66a3d45af38b8c9b50af2a09900404d0e4d600ef176d5ca350b6904a5848974e8147bc0d4518cc86b77cfa662767dc8', '5bd5a9a7529ba5131565162887738682', 'student', '', '', '', '', 0, NULL, '2026-10-20 10:49:20', '2026-10-20 10:49:20', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-8a1b9db6', 'student_1792494738638@devharbour.in', 'dev_738638', 'Test Developer', '78138db6b257f81af969bc7bd003513e8dcd9ccc8cde5be841e6d4af7e792f30262362366beb409adcac121949a50a48756f1f6c4cc843ced1b988355879c6d0', '62e1858f62883cc6276187e2b11d4829', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 11:12:18', '2026-10-20 11:12:18', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-c48a5aa8', 'reader_1792494739166@devharbour.in', 'reader_739166', 'Avid Reader', '5684204f2ef5991b38eff843c4d848e78e014d8062f6f64a8bcaa417045d19ce83855a1b1e03f7dce8f11b42341fd16460f923abc05930fa839f1e41a5cfb023', 'b9153dd59307505c376f76857dd19a34', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 11:12:19', '2026-10-20 11:12:19', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-db03d368', 'coder_1792494742569@devharbour.in', 'coder_742569', 'Code Challenger', 'e390f0357d27bad34f3f2fc4c7e23b209ab6940cb924cbffa04b9b799ade0cdedf2a5cee1b32a4779a31d674dbc3437d8c4d4e9708d1728c3ef7a16acd5d3bc6', 'e15ebbf6a3a279a5e4fc7b75d7cd2753', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 11:12:22', '2026-10-20 11:12:22', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-c4e96177', 'builder_1792494743185@devharbour.in', 'build_743185', 'Project Builder', 'd56b9542c8061df6f9845ec98aa5b0e1ef9109f53d1496d011344008edfead6d8a2c19b6e57b824976d4406aa45dbd53be049a58fa52e3d608803d34b0a2de37', '41ee4b473f7af7ed29914f01de5485ba', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 11:12:23', '2026-10-20 11:12:23', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-1e0789bb', 'intruder_1792494743479@devharbour.in', 'intrude_743479', 'Other User', 'f4ad363cb1dddd22dfc184227d92e5705bfc856f681a33a0e4e736538de3270d4f446741cee7f0f4038012128a1311a6125c629df6ea7b5389f2315e5e6e6fd8', 'e41f8ff506814fa92c429814bcef80a4', 'student', '', '', '', '', 0, NULL, '2026-10-20 11:12:23', '2026-10-20 11:12:23', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-11ae02b7', 'settings_1792494743689@devharbour.in', 'set_743689', 'Settings User', '181123d0a762257e9b2073c51d4d2867b6b59e86f53e900e927a1c1a57f25d53e2ccfd868e3c3351fa0f31e0db7798a08b80aff55a31d1afc3ee7fd68ff77834', '3581ac5c35e5400c2d0ee2f230c25d0d', 'student', '', '', '', '', 0, NULL, '2026-10-20 11:12:23', '2026-10-20 11:12:23', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-7c9dd1d8', 'student_1792500929951@devharbour.in', 'dev_929951', 'Test Developer', 'fb452aeb58b289a6ab22012ec785f32a4ba3e60c321287885725cff95171ded42df2d91f1b21a4d6027c55bd15bcf9c690e3cfd9ab47331c0a0350b3d9dbe808', '8416c1305b895bcf5b184fb3c8c06d15', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 12:55:30', '2026-10-20 12:55:30', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-a62809e9', 'reader_1792500931037@devharbour.in', 'reader_931037', 'Avid Reader', '3bd011226b7654a0e62c66af2a3a721290a8fc19e12c04bce8de86701eddab1255d9f1da8fc41006abf431110f87a3353ed672c042053e28f484182aa479e5ec', '3333a7b0a4202770bac4e5457d2116b7', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 12:55:31', '2026-10-20 12:55:31', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-5defa171', 'coder_1792500934292@devharbour.in', 'coder_934292', 'Code Challenger', '29b1ce042fb1f84677d39570927579231c3a50b14b9e31c517faf32b5f6d19f6f23db612e51ccbe70048854d4b7c5a427c908200998265dfecb52462ca26c83f', '5ddb75256edc5d51fa9389ef2d62ca50', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 12:55:34', '2026-10-20 12:55:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-1db229a1', 'builder_1792500934519@devharbour.in', 'build_934519', 'Project Builder', '0ec3cca70715073d557cc54852c0084f5d33d96e429fe057f3fa9baa903c90290d81ef13ccfc8aa6a41961f33f7d456e0abc6ceb1246b4cfc6028e0996a587c2', '592c6eba9275f65e94a246b7d6e94bf1', 'student', '', '', '', '', 1, '2026-10-20', '2026-10-20 12:55:34', '2026-10-20 12:55:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-9196724c', 'intruder_1792500934771@devharbour.in', 'intrude_934771', 'Other User', 'a6b7d32c18ba0c8b54575e7caa63f92ad802167231d13c93e7478228895fe10c801a5c08536bd18bcc46923a51d40fe56b24159a80a5ed9c34fc40910eaf58cb', '760316339f3a92fd96bf0a5becb02fa0', 'student', '', '', '', '', 0, NULL, '2026-10-20 12:55:34', '2026-10-20 12:55:34', '');
INSERT INTO users (id, email, username, full_name, password_hash, salt, role, avatar_url, bio, github_url, portfolio_url, streak_days, last_active_date, created_at, updated_at, location) VALUES ('usr-97094607', 'settings_1792500934908@devharbour.in', 'set_934908', 'Settings User', '3bfcb6a0acbb0d3fd8283ecdf0185f5aed84e68fd8ec4bd477eb565d463b389e6f6d3266c273ed2cbb10e8e4e8492694828ecd866411d0b9c1221b4fda2a9e4b', 'e5e96d21061fa72529af81c6f20ed8e6', 'student', '', '', '', '', 0, NULL, '2026-10-20 12:55:35', '2026-10-20 12:55:35', '');

-- Table: sessions
CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('feba9982-cd27-413d-b99e-f775cabb5d68', 'usr-1a2a02cd', 'a3afda74c4bb4d255d7015bc97218bb909903d4e4f3ffb7ef62e3313d3e0f3fc', '2026-10-27T07:32:02.331Z', '2026-10-20 07:32:02');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('3c1e26a5-d191-4716-9c9d-6875e71d1a21', 'usr-1a2a02cd', 'e3b9214206e84b082d114f1a4d097d7f8091865f946275ed314201126e764401', '2026-10-27T07:32:02.513Z', '2026-10-20 07:32:02');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('0fd2eb4c-dee2-4667-bc02-8109b49fe5ae', 'usr-5dd58e4b', 'c3dad747ad8a7cc8b8cc06ae27616c983f2ab072207e120cf67ad1ab3c1c77d5', '2026-10-27T07:32:02.867Z', '2026-10-20 07:32:02');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('f165456e-bc95-4b9c-9c76-2196d7b39e40', 'usr-0dcba3b7', '7fc4ccf0a040fff1b66d153bfddc830bba020da75d07e3df026ae8456f468329', '2026-10-27T07:56:01.294Z', '2026-10-20 07:56:01');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('65765371-11e7-45f0-9cb6-c09fff229bd6', 'usr-0dcba3b7', 'a97fe671dffe67f201af95357d7c1ea53472044553993a0c6d53f9530d7689ff', '2026-10-27T07:56:01.460Z', '2026-10-20 07:56:01');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('7413d242-7c68-4a24-9409-aaa01d49af12', 'usr-6788c2a6', 'd3c4f794707cd5b4572888786c8f6bdd27eec428f00757fbac825652e213bf74', '2026-10-27T07:56:01.632Z', '2026-10-20 07:56:01');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('ac99993f-c5d9-415a-b6fb-8597675dc362', 'usr-9b19e8ac', 'cd19c0f4a3f52c398976c5c71186be2c114ca22a00edb3c8fb763ed92c8c0959', '2026-10-27T07:56:04.889Z', '2026-10-20 07:56:04');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('2fbc7802-9306-49ff-ae61-90461d5c21c7', 'usr-4ab882a5', '541dcddcadae39acd446c662d622604c34f60a8c7c8dab5cb1646c31210261ed', '2026-10-27T07:56:05.013Z', '2026-10-20 07:56:05');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('86b6a0b3-bee8-4d94-a62f-2265365d8c6d', 'usr-30cfe77f', '8e5496dfb6730691844581ae0b27be03e2c406b893b6c9547ff7fb7a2dfa4705', '2026-10-27T07:56:05.230Z', '2026-10-20 07:56:05');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('9c89d649-4bfc-411d-898f-b669e35dc07a', 'usr-334bf6a5', '464e6db069e32667c8d43b92bf3fe1815ed47aff64ece723eacd24fc6a72bd96', '2026-10-27T07:56:05.379Z', '2026-10-20 07:56:05');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('892477d6-e335-4a05-86b5-73330f20665f', 'usr-c6923888', '1b78fa18a6073a048d65c91bc400c2928a422a0ea464e03a8d398f5a2b6095a3', '2026-10-27T07:57:34.674Z', '2026-10-20 07:57:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('4b9d3988-ed99-4c7c-945f-874183f8a58e', 'usr-c6923888', 'efb249d31f9a4283c64aa61c0cbf1f12bd49dfb07f0b447abb5f2eac8e7edcd4', '2026-10-27T07:57:34.830Z', '2026-10-20 07:57:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('a4c8a78e-1c2f-457f-ab08-2870fcf3aefc', 'usr-1bc223a4', '3f8e8c7591d8a40b752fe17b4dd1a8dabcf537831989d65b2d07b89810279d20', '2026-10-27T07:57:34.984Z', '2026-10-20 07:57:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('e496f2fa-10dd-48f4-8bac-4de42397de8d', 'usr-6d7c113c', '7902fd052021132cc9198d7d4e83df4d026ed7fed67cb7a46249c74778dfe96e', '2026-10-27T07:57:38.178Z', '2026-10-20 07:57:38');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('ccf3605b-9637-4b18-8412-97767702b803', 'usr-8cb67e6b', '72a90e6fd318117daf694f96751867bf39a9bc893820cc3ad98746bb8a659efb', '2026-10-27T07:57:38.328Z', '2026-10-20 07:57:38');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('1bbb202a-a043-49b6-ac81-58cc6fbfe018', 'usr-ddb3add6', 'f6af2b1b5ba94e48292feea2d16ee4e14ff04f095c8f9ebc0a15bac8b2515ac4', '2026-10-27T07:57:38.501Z', '2026-10-20 07:57:38');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('11ec3b2c-15c2-431a-9a5f-a2b57e53109a', 'usr-0dc7c690', '77ad63b73fdac8457a7d204874e81442f391cb1fd5c7f479e8655a26e4d7af1c', '2026-10-27T07:57:38.633Z', '2026-10-20 07:57:38');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('275b8df0-a0d7-4bd5-b2d0-947330fee91b', 'usr-15d1aa41', '8e41a6c218e061bb91a43ac323f994fd0af760b5a935716413a6583ac9523030', '2026-10-27T07:58:13.509Z', '2026-10-20 07:58:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('0eec0f5b-f0c4-4d3c-b364-995f411bdf5e', 'usr-15d1aa41', 'f37aa807ef54688a264831b03eb650686a9d823e4e1297e3b5737c615412fb75', '2026-10-27T07:58:13.634Z', '2026-10-20 07:58:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('61f4184b-1a10-4122-b3be-46fc0847bc60', 'usr-865d1581', 'abb322f925b4c47b6b49bd4ee485c1526548552a94f577d7fd4bcf6c5f94b829', '2026-10-27T07:58:13.775Z', '2026-10-20 07:58:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('76be2389-ad44-4fc0-8ac7-0ee13f198d88', 'usr-18368ae6', '827f36b25cf22147da25200ff0c2052b1d9c276825c6dd8dbe1146bc1887a050', '2026-10-27T07:58:16.965Z', '2026-10-20 07:58:16');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('c6cb66a2-50da-4a8c-a800-64f8496f45e9', 'usr-f38d3cef', 'd289657a1e50afd8ca22994779b14501e0f37b52cad2859a107240933b7a55d4', '2026-10-27T07:58:17.116Z', '2026-10-20 07:58:17');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('d8cbc3aa-dbc7-4c67-b21d-9b9f22985755', 'usr-1e2878b2', '92192256b9ed71c3bd109e2577b9a7b75eaf58dfbe9555688f864cb3e98957ee', '2026-10-27T07:58:17.292Z', '2026-10-20 07:58:17');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('f277dbe5-2db5-4607-a17e-d4bb9785c9f3', 'usr-e051e843', '4a97a7cc185b2660c10a2718ebeb6c0dcc6d24718134fe5a7983ec3cf9f65db8', '2026-10-27T07:58:17.415Z', '2026-10-20 07:58:17');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('20eaf6ce-6360-4030-a846-04b8f4210138', 'usr-6773ab87', '00111ee49a5ca1374c1081262056bde4d13e2bb56e8a130654c92120587565c2', '2026-10-27T08:11:44.555Z', '2026-10-20 08:11:44');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('338dd0b5-824b-4e6b-b52b-70b4eb73c6d3', 'usr-6773ab87', 'ab51818554e14dfc27bf66403096fde17d6c8c39d7fab4a9e6b58c2c0108bed0', '2026-10-27T08:11:44.750Z', '2026-10-20 08:11:44');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('a1dc035e-aa88-471a-82e0-7e312f5c296a', 'usr-bb7465ba', '80d5f54ad8fbfc81aa4d79669b00ce220c64fd963187ce599dca062486c0ddd7', '2026-10-27T08:11:44.934Z', '2026-10-20 08:11:44');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('0bc6182f-36b7-45f6-b0ee-11479d3a457c', 'usr-26836243', '8a740e8692d9648465b1293e75a8f04ae1e6d2e5b53dc29882e13a78899087a4', '2026-10-27T08:11:48.189Z', '2026-10-20 08:11:48');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('23a17ea1-2e1f-4d38-9ad5-357484dd616c', 'usr-258d9c44', '1c8af9b14e4137cf44cba15723689f226e914a32935c18e8d8d245c341ebef02', '2026-10-27T08:11:48.368Z', '2026-10-20 08:11:48');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('d77187b5-d920-48db-a3e8-33cf815e7674', 'usr-cf986487', 'fbfa2747f5d0c8cae09245df101af4cf8608b15287abcb6d13855e0f1dff867d', '2026-10-27T08:11:48.547Z', '2026-10-20 08:11:48');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('beffc85b-dbf8-46a0-86ea-73feaf43f537', 'usr-206484ea', '735d1a127c9dbb9c195f04d7cab4f23481e9da2b1057591885bd2455556a1255', '2026-10-27T08:11:48.693Z', '2026-10-20 08:11:48');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('a35e87a3-77c7-484e-b369-9c1c4dcdceba', 'usr-7d384ef6', '0ecc9ed24e16b2129a6abf77633d89ec636e88dd5c09e2ed80be0f2fa93cab3d', '2026-10-27T08:35:47.129Z', '2026-10-20 08:35:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('b78d6a2d-6569-4e4c-93a0-c0c875072ba1', 'usr-7d384ef6', 'a1e784f04063a8d63eff0046ddf24fa6e4d99b36ca589e3e08e319a8a2109bde', '2026-10-27T08:35:47.346Z', '2026-10-20 08:35:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('3168b8c8-0f1a-4888-8d8b-d7ac8ed6fce5', 'usr-ddc024ae', '32b5ee62ecdb7b6dbb9830730dbb4a5d2d0420a758abdbce0609c2443c60fbc2', '2026-10-27T08:35:47.533Z', '2026-10-20 08:35:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('7e012c2b-8ffb-4602-ba94-bdae488af35e', 'usr-24979f7f', '6ae677cfc48d627d4b193d7e0901b62360e934a3cecb77b26c289ff58a603ab9', '2026-10-27T08:35:50.761Z', '2026-10-20 08:35:50');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('1e107deb-b3a9-4328-9850-8ec51f018b37', 'usr-b80e1d3e', '6d445fad92f16548f6a48c113d50d908bdde20261649e18d883f5209636f6d38', '2026-10-27T08:35:50.951Z', '2026-10-20 08:35:50');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('6b51c858-735f-4f39-aee8-0191b867c456', 'usr-f5b1f256', 'c1c61a43af464fdc2ebb39e88cb9fb216302929929e0a83fc76f99cfe4c6fe07', '2026-10-27T08:35:51.134Z', '2026-10-20 08:35:51');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('b8474808-c095-4e25-a06d-1aebe0a553d6', 'usr-e73bcd7d', '3a1a509fcc7019ffa9af9a22df99859342ed7e6d8675643f19ae0205008e6c4e', '2026-10-27T08:35:51.279Z', '2026-10-20 08:35:51');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('2330ac7a-32a5-4dac-b6a9-070843283a7b', 'usr-19c63d83', '0990fc330dae430012629edede4600903aa6a56e43a539fc4f47103d4f3a1fa5', '2026-10-27T08:39:35.357Z', '2026-10-20 08:39:35');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('ddf60d2c-4e28-4c6f-b2f0-dc5573994ace', 'usr-19c63d83', '390886f1dfcdd30520d8796afc0d623052c0647c530ccc1a66b7a957c0a803f3', '2026-10-27T08:39:35.558Z', '2026-10-20 08:39:35');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('9a96db66-0692-473e-93e2-9de18996e748', 'usr-0eac25e4', 'bff5192c1b76961009d210c52997ae7b2084d1be61fd5b0e2bffd61f85812d25', '2026-10-27T08:39:35.750Z', '2026-10-20 08:39:35');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('b9e941a9-634f-4b4b-b96b-7a08f0edaeaf', 'usr-aba7424c', '9e54a5a4bc228efcd83bffcacf5ada5d2b702fc755dc76702f9166d7fa7ea92a', '2026-10-27T08:39:39.145Z', '2026-10-20 08:39:39');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('8383487b-d90d-408c-82d6-c8f573a10502', 'usr-225952dc', '202c69379ceb98ec3d0c3a0cae8b9203e1f7e2e3fba669ccaaa43041788a1b97', '2026-10-27T08:39:39.371Z', '2026-10-20 08:39:39');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('e906b188-d68c-4cd2-967e-6fb6b1a5bca6', 'usr-e9fed580', 'b7c9920ab475db247b1f02e6dbd2fb71c4ef47e28749f07b9383ec15e32d6244', '2026-10-27T08:39:39.611Z', '2026-10-20 08:39:39');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('608f012b-db24-4c99-b6b4-811763e322bc', 'usr-3db9f967', 'ceae9db4ef9cadf6fc7624da0b6ea2b24577ae0960e1aa8c16db10aad669548e', '2026-10-27T08:39:39.876Z', '2026-10-20 08:39:39');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('b86767d9-0a68-4105-bb7d-9178ca1ddd85', 'usr-0571a769', '7d04f85873f11e8f1b55d769f51338a80e93c64beb6565d85701c9abbd50dbf4', '2026-10-27T09:00:20.680Z', '2026-10-20 09:00:20');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('fa8289fa-cbe9-4786-825a-f421bcd0f366', 'usr-0571a769', 'bff7e93c0ef5304fbdd75d2f1f004b9bc9368cfa935ca47162e86574a6aa071d', '2026-10-27T09:00:20.933Z', '2026-10-20 09:00:20');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('ec0b1040-afb9-416c-9f13-2c092eff504c', 'usr-128e7287', 'bc08d11beee37950755d6a32af69a68acbb31c0369ca9f442e3607da755da6a9', '2026-10-27T09:00:21.130Z', '2026-10-20 09:00:21');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('0186bf9c-ced5-4358-b988-ecba58c2b5a1', 'usr-2787ac99', 'd2579c99ea64e5008df66e963aafc8d62bcd70ca04ade3b641636b0c37ba91aa', '2026-10-27T09:00:24.404Z', '2026-10-20 09:00:24');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('53f99694-9472-4696-96ce-b45383f98367', 'usr-e05e9cb2', 'ff6a42b2438097734f4dceb1dd7d6a174cfefeadb5e0044d4de72da2de4c18cc', '2026-10-27T09:00:24.617Z', '2026-10-20 09:00:24');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('5964ce7b-a2b3-44f6-a077-23ece841ac49', 'usr-3f6c82c2', '8031c0f17fc294bfaa173592e0548f660d90d3dbd9d9978fc6432a6ead56cdfc', '2026-10-27T09:00:24.879Z', '2026-10-20 09:00:24');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('44f4df39-81a8-4fa2-a4a4-7502f79f2722', 'usr-ac4c64ab', 'ec99643cf8b78e8872ea1d5002d839165f5956788ad8df452a938508f1ed0985', '2026-10-27T09:00:25.052Z', '2026-10-20 09:00:25');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('1c9e67a4-60a6-476c-87eb-760904459e8a', 'usr-71f7ca3f', '066a15ebbc98d1deedb2ce06497e3163c84ac03c37c5b27933fca050e281b30e', '2026-10-27T09:09:43.519Z', '2026-10-20 09:09:43');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('987a9b7c-aea7-494a-8735-096314255b5c', 'usr-71f7ca3f', '102838745211e3f2452ab899fe5f1b5d7f5564a36e687fbf1ffd8d929eadfdd7', '2026-10-27T09:09:43.857Z', '2026-10-20 09:09:43');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('554aa177-4932-4f6a-9474-499259e2910d', 'usr-731014a9', '58a791338b302672099a24926799078be9bea018fbd4eaf160609028ec915dc5', '2026-10-27T09:09:44.088Z', '2026-10-20 09:09:44');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('36f14730-c541-43af-ac30-785d9972a652', 'usr-5c994333', '58a877e4902bed99ff1c4c307d45474524a0c042f8b2234731b8ae70813a3e0d', '2026-10-27T09:09:47.289Z', '2026-10-20 09:09:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('785bfd76-0392-4fc8-b2ec-95c848c50d2e', 'usr-f8cdaf01', '2af6fef5c66cf62660945e8233f43f948cacea6ae11c920b06e33e364775d4cb', '2026-10-27T09:09:47.441Z', '2026-10-20 09:09:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('fde8b1a0-989b-4fb0-ad70-a0993dffee20', 'usr-217811e7', 'fea1a4ea95ee93b1caf80ec45d8b239e315a2de9a13f898d022cbca1bcb386da', '2026-10-27T09:09:47.612Z', '2026-10-20 09:09:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('9967e019-245a-4529-962b-7d67be9f712f', 'usr-9062c2ca', '973497d0cef4927946e797ddfa4f0925fdbecdbd3724bf9d93e163ec1dc58154', '2026-10-27T09:09:47.736Z', '2026-10-20 09:09:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('3db06a6a-829a-460f-80f3-3a5b4146d65a', 'usr-7bf07c58', '7872350e2d0437953573f8b7b8eb32ec5fbae7ff30a57c3535f35efb70ce86c3', '2026-10-27T09:10:22.177Z', '2026-10-20 09:10:22');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('840556b7-8e44-44d5-be9a-2d201614d574', 'usr-7bf07c58', 'f45515e9d03b5a91ab29b88b7fbd58c97af5003535540032beb7f9824d736f96', '2026-10-27T09:10:22.310Z', '2026-10-20 09:10:22');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('27b00de7-cad4-43ed-ac96-34cc21c68632', 'usr-24a19883', 'cef4e9820035fadcf57735ece1d1435168c985269edd10dfae2332d5214655e1', '2026-10-27T09:10:22.435Z', '2026-10-20 09:10:22');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('d82edd7b-1341-4f77-acb8-1c8eac65ab57', 'usr-8253842d', '24ee1dd2689a5a9d14fa60e164d449bf1a4029a988a78305b65eaad955cac9cd', '2026-10-27T09:10:25.625Z', '2026-10-20 09:10:25');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('3db9fc22-4e0d-4b26-878b-552105cc998f', 'usr-4acb5d2a', '0aedbf744181563cde84be9638aee4da7cd14a89216785242b83d7035c864a85', '2026-10-27T09:10:25.782Z', '2026-10-20 09:10:25');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('34f12e20-9286-49c5-8f79-ca3889e99b6f', 'usr-7ad9df0c', 'ecc81983ac59fb01759527e13e8eaa679119b2ee2efa4d5f43b528c306048a9b', '2026-10-27T09:10:25.943Z', '2026-10-20 09:10:25');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('773c61a6-92b9-4b7d-8807-a8b531786382', 'usr-3b8294d3', 'c444dcb63053db7a4e5f6052833cc96bc36d711d6683134afc227b07c6b63c7b', '2026-10-27T09:10:26.102Z', '2026-10-20 09:10:26');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('89911206-95bd-4cb3-a426-8e4875957e0a', 'usr-c05564e9', '37186cacfc879b805fe82933662206b49949705a8f4faa97d66437b3b343b6ba', '2026-10-27T09:12:09.405Z', '2026-10-20 09:12:09');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('43987fd6-87eb-44fe-8eff-dc0ea42decf7', 'usr-c05564e9', '5696877060017a2acc25eb520fa212a5050351636933af2efb8b96484a5f3030', '2026-10-27T09:12:09.547Z', '2026-10-20 09:12:09');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('9f14e678-d7c5-4c31-b98d-55fac2b5c5e1', 'usr-eba1faa1', 'e9ba42bb48db517d06d83d258e0acc0f5de7efd7b212ceb6d799ef4fd2a58888', '2026-10-27T09:12:09.670Z', '2026-10-20 09:12:09');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('75c168d4-bd0f-4298-aec7-2c6937eb7ec1', 'usr-6a70d6e6', 'edebb65dc26d82bbee2c412a18d70abd5dfe53b6622282badfaec1221105515c', '2026-10-27T09:12:12.929Z', '2026-10-20 09:12:12');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('9fae33f6-7d70-49ce-bd4c-ccd4d754021e', 'usr-56cef437', '4ca2e265d24f4da75191dd4c33b326be1b4e063a7ce2a207ba9d27157e04a1fa', '2026-10-27T09:12:13.144Z', '2026-10-20 09:12:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('7e8740ac-a02e-4345-a33e-295a668e4d4b', 'usr-99fbb25c', '5c4fcd77e79b6240604afac0a3e51f96cb461305ba4a8efb02c376927000e9ff', '2026-10-27T09:12:13.348Z', '2026-10-20 09:12:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('332fddd2-73f4-42e5-a084-e74dc9c10957', 'usr-ead70c14', '7cfe5f405a8e115c59311f8e019b8f0496a2a5cc7b611ff37038d039c85421a8', '2026-10-27T09:12:13.471Z', '2026-10-20 09:12:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('578ee139-20e3-45a0-b767-6bc2f2fef835', 'usr-201dcaa8', '92ac60ee75acb6f9c2c26bedff59effea3973eaa29b87a5750d5814cd8d7e0be', '2026-10-27T09:13:18.799Z', '2026-10-20 09:13:18');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('b99166e3-12e6-4932-bfc8-1935d6110ed6', 'usr-57b405f8', 'a598a04cd8fc8bb0a1cd461c301f2edf16dbebedf74f43d88debfcd767fc6961', '2026-10-27T09:20:47.235Z', '2026-10-20 09:20:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('4cf771bf-e309-41e8-97be-c04ee7eb7b07', 'usr-57b405f8', '0fd0e2b638b20740bf9f11ca3420593098a6d0288dfe5ba2ead19e6250421634', '2026-10-27T09:20:47.388Z', '2026-10-20 09:20:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('8cc88045-5c34-443f-b1cc-151e64c99851', 'usr-a29aa3a0', '86140eef22d0abea02dc03c62b1c6f13208512d1ecf3978ca8ef11d1855125ba', '2026-10-27T09:20:47.545Z', '2026-10-20 09:20:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('ccda71ad-7ee7-46b5-9789-f6abd8d8ad32', 'usr-a6e8eb39', 'bfa2fdee3b973e8beb94b8961ba48caf7626ac937750035fc227e8cb6045ac65', '2026-10-27T09:20:50.772Z', '2026-10-20 09:20:50');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('5f490032-f6b4-4214-b3ed-360c7895a844', 'usr-737926e9', 'a359466f3cdd58223511ea708d159ed3bcf0a166a139c5aa9928c426acc527bf', '2026-10-27T09:20:50.950Z', '2026-10-20 09:20:50');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('4673425a-4800-4c44-9ae9-143f672f685b', 'usr-873c4bb1', 'b58000c8ac20661de80b29e62f003a11fb79d284865039c0dd80148e0fc4ceb2', '2026-10-27T09:20:51.156Z', '2026-10-20 09:20:51');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('af2c62b1-1abc-4f88-9a58-79c47aa6cf9b', 'usr-8246f8eb', '198882ec4ed945d0199565fcbee30f0b34920e63efd678d707d8b071d1b94505', '2026-10-27T09:20:51.308Z', '2026-10-20 09:20:51');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('990f4d6a-cc45-429c-99d4-9402032a7833', 'usr-480ade78', '9789c0fa2e51a206ec0ff1a85fa25c073fb63c86291a97b79c0594b905cca1f1', '2026-10-27T09:41:43.755Z', '2026-10-20 09:41:43');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('3dd315fd-330b-4027-a9b9-0fa233ede0fd', 'usr-480ade78', 'cddee504782004c48e89e63c6fb2db2b149c55d12b687474dadc7a564436a22d', '2026-10-27T09:41:43.866Z', '2026-10-20 09:41:43');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('4b2ddd16-bb1d-49e5-895f-036d8e028e33', 'usr-b7501abc', 'b08c3b9ed76c3f24a6b7b6ab197c049f6643e0d57557bc13a8643ee3642285f2', '2026-10-27T09:41:44.001Z', '2026-10-20 09:41:44');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('37137eae-9839-45d6-8d9d-525f8c6a1fb2', 'usr-524e0b5a', 'ff76833351a5445f3dcf36e5885d4db7df0bb57329430575b48fd9d7e8b6a930', '2026-10-27T09:41:47.180Z', '2026-10-20 09:41:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('26c56954-0ee3-420c-b2b4-bf2fa8a0f66d', 'usr-e155cfd0', 'e6307428471db7d0c0fa370dfb352d5bd0e8d3a536d83a8c6be975851c35946a', '2026-10-27T09:41:47.336Z', '2026-10-20 09:41:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('e635964f-6167-43e9-a054-a1b1825b9581', 'usr-56826960', 'd7ab10a0089c280585719b050ed214bbb9fe7a9fb0df23d9a2c887f392d7e080', '2026-10-27T09:41:47.512Z', '2026-10-20 09:41:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('4b705db3-94c4-4893-9202-37e94c20c890', 'usr-0e4bac5c', 'de1e407c7e3c5173b681f66d33d7635c1c716c6934380af034d30d2a92da9849', '2026-10-27T09:41:47.650Z', '2026-10-20 09:41:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('213ccd1b-19a4-42ce-bc88-c115543bac46', 'usr-de0e71f1', '5ec319cb2a195e463018f4b9f5e2b1a1f45b535f4f09b2a6811270dfa705422d', '2026-10-27T09:59:09.581Z', '2026-10-20 09:59:09');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('5b415fba-d4c1-4d25-80c1-c22030a0ca28', 'usr-de0e71f1', 'ef5a55bc9fdda65d9aa360e281824908f7b489b8b68ecaf4e3f7ebd64d9c1c3b', '2026-10-27T09:59:09.822Z', '2026-10-20 09:59:09');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('793d190e-25dd-4818-bd2a-6e5151bfbb02', 'usr-596f2a7a', '2298c8cd9a08ea07824d5cd719aad3e9c75a1c89745caa0df4b59c9031b90d92', '2026-10-27T09:59:09.974Z', '2026-10-20 09:59:09');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('636959c0-a8d2-4938-b50b-ac8aabef38db', 'usr-c3e1f6b5', '20adb05bcdfe43a2a0b29f8e7dc314ebd2034fae276888ba9980504e1033dd83', '2026-10-27T09:59:13.284Z', '2026-10-20 09:59:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('9dcf29db-d14b-477a-abad-4b3bf07f1778', 'usr-1da263d4', '780deef519f68451b3a71f034a26bc3c6e2ee2d62ca1006a34c7970a96ecbba6', '2026-10-27T09:59:13.528Z', '2026-10-20 09:59:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('c468a86a-15df-49bb-ad66-d4ee3fa70ea8', 'usr-12b9f115', 'f79efd9a8e40e0756bf0230202e90748552930de2344d8fb02c5bf3917f06b66', '2026-10-27T09:59:13.737Z', '2026-10-20 09:59:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('7469ace3-f2c2-4e63-815f-d9eb288a617e', 'usr-9965bf7d', '93e10ee73ba7d7b431442d7d2a173429e148ce8a63fa31f3150f8af2d6d497f8', '2026-10-27T09:59:13.891Z', '2026-10-20 09:59:13');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('94fe3686-9b42-4fd0-9c91-0e4bf3832f36', 'usr-f827db95', 'ad9fa2a8b5f07c2d8c26448ffdffe348bb0585c1ed04696b2bd23fea70a9fb5e', '2026-10-27T10:00:14.173Z', '2026-10-20 10:00:14');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('c64c6785-82ba-4d54-817b-29285e053698', 'usr-f827db95', '8b51e14641686ed26281481395d37981abb64f4f276a52fefbc0c4707d1213e8', '2026-10-27T10:00:14.302Z', '2026-10-20 10:00:14');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('326c13b9-89f2-4c39-9247-16b65ef17a5d', 'usr-ce837f2b', '5b2002963e0b457a953fcec98d0561911e1b87b91d67b8eeabd22650c195bf51', '2026-10-27T10:00:14.433Z', '2026-10-20 10:00:14');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('c07746c2-f006-442e-8323-15876ba1de58', 'usr-c419646d', 'a98bc7feec12f0632ddacddfbdafae5c5ecd01ce4a52bec184939ce61989d524', '2026-10-27T10:00:17.690Z', '2026-10-20 10:00:17');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('8fe1c14d-5c4a-43e3-bdc5-540058f17344', 'usr-3a068fd1', 'a6c32f40f78d7d5bafd5350432e3c2e9a76734bb7575223ca08b32fea81ca694', '2026-10-27T10:00:17.905Z', '2026-10-20 10:00:17');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('ff1e5983-a645-4691-9ba6-de61f9c6544b', 'usr-f8e9b589', '030548566e00e28fa6a522d1ddec3ad63894bcab1c09a9a1a5f4ae218477a245', '2026-10-27T10:00:18.159Z', '2026-10-20 10:00:18');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('44eec887-b1ba-4f8c-88af-b01a6544328e', 'usr-bf5b0b28', '2368017269f1e6990099bf524f8a64b329c6ef665c6ce443c743aa2a614a726c', '2026-10-27T10:00:18.312Z', '2026-10-20 10:00:18');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('c980fde3-b8df-4647-8f7a-982a4ef65ed2', 'usr-100b21d5', '2b3931ac3a12223d637c3231870a8fb3ffb3b0f58a915ebc04cb8e64e6e90888', '2026-10-27T10:24:30.542Z', '2026-10-20 10:24:30');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('6959ca45-187a-48ed-a554-7a86ae6253d7', 'usr-100b21d5', '72526bb90c10d76e832d05952b63b4529a9e8159cd38b99fc03acd90f5f53e27', '2026-10-27T10:24:30.694Z', '2026-10-20 10:24:30');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('8a26f8a0-3a94-4d30-a3d9-7513e3729fb4', 'usr-3291f84a', 'decd489a69e0b375a7df38e8deaa1090b6d9fba6bf32f6f8688048a587346eb0', '2026-10-27T10:24:30.831Z', '2026-10-20 10:24:30');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('5fec1753-aa0e-467b-9068-f307384400b3', 'usr-481e6138', 'fd52714546a14b138cbb7b8e8d6da48002e8e2e72d4af59aba00c50727d6a207', '2026-10-27T10:24:34.013Z', '2026-10-20 10:24:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('9df07183-3fea-4777-b186-509589aaeecd', 'usr-07a0383c', '14702785f4500b0de3314f011f19c9e64289485a54a0e47d9d9b2cf401576cc5', '2026-10-27T10:24:34.191Z', '2026-10-20 10:24:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('d3135047-8a66-4320-baa0-b0a54a140d8e', 'usr-851e573b', '98d2559ea9bf5a84ca01a30886a795c34c6bb36b6b4c5914e0157aa985eae0aa', '2026-10-27T10:24:34.421Z', '2026-10-20 10:24:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('e9a990f3-3f2f-40e0-81d3-2421061014d0', 'usr-98b34dbc', '1594fe2461fc7de5fc4416764ab7333c3a230b02670321eb6434963406205bb9', '2026-10-27T10:24:34.628Z', '2026-10-20 10:24:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('fa5c8d4b-0795-4298-ae58-810bc8d9e933', 'usr-a5ce8755', '28c79e8aa53c6e0da3109074abe31f5e96ca68a8145c97237e9de520ec4c32c9', '2026-10-27T10:25:55.414Z', '2026-10-20 10:25:55');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('90f88015-3524-4476-8f9c-db528333c647', 'usr-a5ce8755', '8bf971c8d8849ac3754d29d5d991890d91e32184ea69e94416a146b923c7695a', '2026-10-27T10:25:55.585Z', '2026-10-20 10:25:55');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('a5195437-d61e-4468-ac5e-badb62d6bcf7', 'usr-a37255bb', 'c9a1d5766851f8bd8b0eb05f80e8a578e97f171cea3ae6069c0038f5b50589ee', '2026-10-27T10:25:55.718Z', '2026-10-20 10:25:55');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('bd4da8d2-06a0-4696-94db-04e972265bee', 'usr-6628001f', 'fbda14e2914314ff744cdc9ef5fe336d302e1b88e8b714d74e480ee64200521d', '2026-10-27T10:25:58.926Z', '2026-10-20 10:25:58');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('983b2d5d-02a0-4a26-86dc-5839dc2a0dde', 'usr-2c868f8c', 'ecd033dee259e567950a92f4b7b745ba20f96e3c7cbf3f4059508cb464b89706', '2026-10-27T10:25:59.095Z', '2026-10-20 10:25:59');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('5d185899-f28e-4e26-971b-b02701bf3cd7', 'usr-abc1a9fa', 'a0ae901fc4de6c074587b77000e0e7f7d0bcd5e743780f951c12f2d671b1eb44', '2026-10-27T10:25:59.286Z', '2026-10-20 10:25:59');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('234d6c50-b899-4346-ba53-3c44efa4f831', 'usr-214d5a75', '6cf1f6b735abfd7dd6e0d5326359372ef447beab3307da45ee16af21eae932df', '2026-10-27T10:25:59.434Z', '2026-10-20 10:25:59');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('fa0e2355-df54-4230-8eb0-4a658cfa2697', 'usr-7c7ec8ff', 'b0f21c39818ba03ce57c6d146dfb805a4fc6cd1c2a177c6560c295315f75ec35', '2026-10-27T10:31:26.410Z', '2026-10-20 10:31:26');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('912f5b6f-e07e-45c4-9aff-023a3c76e4c2', 'usr-7c7ec8ff', '3b91527a99262b4022cd7966b57257b5a310121a1810d1bae5cf8ed09cff29b1', '2026-10-27T10:31:26.581Z', '2026-10-20 10:31:26');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('f2cf8c38-dac8-4dd7-92ce-7c13404db217', 'usr-92c4d906', 'ac8e4fbe2672ba4ba02a893af6b9925dbdfe428a1f4ecd80aeeb32d2a9f11f7a', '2026-10-27T10:31:26.757Z', '2026-10-20 10:31:26');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('c9200490-3a68-4ac8-8388-e798f7ab4438', 'usr-5dc98264', 'a60459d2906c1892cb9346bd7f9aedddeccafa3989d43b77c702574055f506e9', '2026-10-27T10:31:29.977Z', '2026-10-20 10:31:29');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('66fc1dc3-a6dd-479b-a7a7-2d724be7f000', 'usr-502ad689', '6538f7e7274ac66726b7ee4c335c0ed0abf767ce174f38dc81cc34dddf5ed65d', '2026-10-27T10:31:30.143Z', '2026-10-20 10:31:30');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('90d13342-d1d7-4cce-8f3e-7a27da1fc6bc', 'usr-217cc732', '4fb74fe7c8c247c669af5736aa2598e4ec12db867ff434d7bd60cf42c7b1f4c8', '2026-10-27T10:31:30.349Z', '2026-10-20 10:31:30');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('de098499-194d-4d44-8864-a0577b8b0793', 'usr-ac677635', '6acbb805fa97420f562d546e9afbf557c6822ceeabb20afc69d3112bbea9be68', '2026-10-27T10:31:30.477Z', '2026-10-20 10:31:30');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('6d91416d-e5f3-4e23-9b0d-292843827bac', 'usr-85f588cc', '24b6ead5b33f0e1a368d5b8952574712c2c6bd1904f283ff2adf1eb29b8365d8', '2026-10-27T10:41:11.949Z', '2026-10-20 10:41:11');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('250173ee-0229-4109-b63f-0d786e60eec3', 'usr-85f588cc', 'ba3e3d333462957f7c46f30d070a66f797804a3f4e39364f356dc33e7896debf', '2026-10-27T10:41:12.177Z', '2026-10-20 10:41:12');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('46f70b73-a6c5-49ec-9284-122ca5ed1faf', 'usr-8903a3f8', '4f1ee12ae51357e8e91eab079650cc0d9e033e7d6eaabf47bd5c13178517c4ba', '2026-10-27T10:41:12.387Z', '2026-10-20 10:41:12');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('e63478fc-9dee-4071-849e-648595a92836', 'usr-68c022ec', '80580f85d95e834b0c88cd08b863b08aa846c70e4fcc5c89aa935e1cfa5fa60e', '2026-10-27T10:41:15.751Z', '2026-10-20 10:41:15');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('b03e8591-242f-44de-bc1c-61f7fcc3d8bc', 'usr-dd4e2eee', 'b121bef6b9743716f7bf3d31fd65a9ded8e6a5a954578d8739f24acb6e5f5c02', '2026-10-27T10:41:16.047Z', '2026-10-20 10:41:16');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('478a0faf-d3c6-41cf-8945-1b7af2e7c9e4', 'usr-69aead88', '437754cf1b98b24f2d9d010965715f2724af99707e02a10e2bcc42cbe7d94665', '2026-10-27T10:41:16.334Z', '2026-10-20 10:41:16');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('d37ea532-aeb1-414a-8f9b-9f0a1df8c11a', 'usr-7b9f67d7', '321c4a6949c96107685d49dd782561fa6d8beebacda951aff11074131ab7b3de', '2026-10-27T10:41:16.562Z', '2026-10-20 10:41:16');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('d2613285-d81e-4882-bc69-5c7f167d924d', 'usr-d31446d7', '187f53dfe390fbbe79b54bba71e3cab706c0d783a81434f527d882bf0b383301', '2026-10-27T10:44:47.130Z', '2026-10-20 10:44:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('7080ccd3-c6f4-4112-9558-388a01998be6', 'usr-d31446d7', '29bcbee8a258c97d2ce565247cfa52cefbf1b9d4c65accc392af1cbaaf4d8f6c', '2026-10-27T10:44:47.465Z', '2026-10-20 10:44:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('0cf5fe59-9dfa-4ab0-9091-5606959743b1', 'usr-d7c89a66', '5aeb7f8bd8e71bfa3aa028270dfcba9998d4abae2ed7a9f392bccded114e21e0', '2026-10-27T10:44:47.916Z', '2026-10-20 10:44:47');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('e77a3b54-4b19-4be5-bd96-021b608ec62f', 'usr-334b1c53', 'c386a3132f2acde71ff844a4b1e2ced76629e0cedeb73b5e7000f8891702d2fc', '2026-10-27T10:44:51.579Z', '2026-10-20 10:44:51');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('a21358b4-6ae9-4f32-9bc6-5496aac1cfc1', 'usr-2a08125c', '7802d0d3c9d1eb9928d75984f1e9ead718cb03cf0184eb398e5dc2a21ae311cb', '2026-10-27T10:44:51.842Z', '2026-10-20 10:44:51');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('4ee51ab8-dd58-47d3-995f-71ce21896076', 'usr-53c1a5e9', 'e99c6c2c318422322aa328439e058dd4a0d0ff272304f9234b4947174511dffc', '2026-10-27T10:44:52.184Z', '2026-10-20 10:44:52');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('68fca052-07f8-4329-be3e-9b25b380328c', 'usr-64ce7ecd', 'f273a3b24b42a8f9b76a3dfd144732de7eeb584c1862cdea108346c73604b762', '2026-10-27T10:44:52.581Z', '2026-10-20 10:44:52');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('19411acb-68ad-48b7-8ac4-2e6b516bd042', 'usr-931a5f2c', '140475b1dfa731c58554e3b8faec782422745fc73e7f8c524f3083dba66eb912', '2026-10-27T10:49:15.647Z', '2026-10-20 10:49:15');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('9ea6f7d1-278a-4d31-90be-9303a9b79941', 'usr-931a5f2c', '8fe7114e5c86de7f1f3b2e473635e655faa6091a03f992895bb40df0fa2c011b', '2026-10-27T10:49:15.980Z', '2026-10-20 10:49:15');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('ceab9029-b8af-4c79-a75c-3eff19a208ed', 'usr-9d24b4a4', '05877b60fea00beb3e9b127d0c93ff98d7b8deb0c41426537e7aac4735456127', '2026-10-27T10:49:16.250Z', '2026-10-20 10:49:16');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('4670d8d3-3af7-4d23-bf89-db6a828f38eb', 'usr-b722fdc1', 'f2fbdda6988d3a19b7322053bcea555159a3a9a04303d63484a3312feadbd8cb', '2026-10-27T10:49:19.658Z', '2026-10-20 10:49:19');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('0b656e87-06df-4ce9-a164-3b293f96af88', 'usr-9abf4eb1', '6b35eeb9aebed3c33503a22a065fecde8443044f4c4d2a940c20433314834fef', '2026-10-27T10:49:19.931Z', '2026-10-20 10:49:19');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('6a839668-3683-47db-829c-ef9ea0c1d8d6', 'usr-c1a3ff6a', '59b75b9e08d55cefcb8588fdce4189ce9dca00588ab6c0369135095de73123cd', '2026-10-27T10:49:20.199Z', '2026-10-20 10:49:20');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('93c9fdc2-8249-4e80-9ab6-b724f7b8274e', 'usr-80111700', '94082ad1c59905a72c1eb8a0992495597e168cbe56dbfe503b864110ba751b38', '2026-10-27T10:49:20.362Z', '2026-10-20 10:49:20');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('2237a984-83e2-4f63-b1a2-bbf2fd0e1a1f', 'usr-8a1b9db6', 'd8bb914edb5ed959288e0537de02a31e4729b05a5fe73260a7bbe0d834b337ea', '2026-10-27T11:12:18.856Z', '2026-10-20 11:12:18');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('b8f190c2-caa5-40e4-bd94-296da12521cd', 'usr-8a1b9db6', 'bf4b68ab60d4718087d919fc188a466438a0bb3757ec658c9af827d9d42a2208', '2026-10-27T11:12:19.099Z', '2026-10-20 11:12:19');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('1bc549a3-9751-4d57-a2d2-badca6664ce0', 'usr-c48a5aa8', 'a77a4f70392c50db224a9cd85388b03ee93d65fa900a0c88ac9841cc54b10c0d', '2026-10-27T11:12:19.305Z', '2026-10-20 11:12:19');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('a2a302fb-606c-4ada-bb6a-8a240412008c', 'usr-db03d368', '99e9e4843fc1b0fcd8ad808f3e72c888b8106dc6ae49052bfdfe62724aa3ee02', '2026-10-27T11:12:22.874Z', '2026-10-20 11:12:22');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('c2ecfe3c-d631-4b4d-847f-bb194e58eeb9', 'usr-c4e96177', '797f8e8e300726c22b6c6672ac640744d3888080253b77e03153291fe966ced8', '2026-10-27T11:12:23.373Z', '2026-10-20 11:12:23');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('4cfcfdf3-12e6-4d18-aefc-b070823d7d2c', 'usr-1e0789bb', '6bedab900abb47fc22f06f13230df3720de57842087aed8a9c14f0b9663f33a0', '2026-10-27T11:12:23.646Z', '2026-10-20 11:12:23');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('79c78967-13bf-4884-bd2f-a78c34030d1e', 'usr-11ae02b7', '12d73d35061bf0d2c9228ca3c061c4c120b4a85cae9ccf58525090a99b131b53', '2026-10-27T11:12:23.812Z', '2026-10-20 11:12:23');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('466283ab-40df-4f1d-857c-e32c7eb51730', 'usr-7c9dd1d8', 'd42d644efefc55f734f5659f2e3635b234ba19ee4531accd26d7f4661b070525', '2026-10-27T12:55:30.835Z', '2026-10-20 12:55:30');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('d0125476-1320-416a-9c38-563adef8d03c', 'usr-7c9dd1d8', 'e1ea8884757db65716d29ba96d07b3ee1a51ab8c83cb72f3c6a65d3d2abd9aef', '2026-10-27T12:55:31.005Z', '2026-10-20 12:55:31');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('3414c051-aa93-4f57-9ef0-c39cb33f9c3a', 'usr-a62809e9', '4bde0dcae8d5375a08895c9165d380ccc9d10f213506ac8aea9f80090743cc8c', '2026-10-27T12:55:31.183Z', '2026-10-20 12:55:31');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('bae38758-771f-4f55-931d-65b5cafdfede', 'usr-5defa171', 'a2d12833d99933bd6173e66de573e8e8e06f1b7b8ff0ac30da19d7d503d09927', '2026-10-27T12:55:34.440Z', '2026-10-20 12:55:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('d6fd0958-bbd0-4a7a-b023-cfd39ccc3f13', 'usr-1db229a1', '2b9df1a7f13f572de9a3e3687e1b277b3be48482b088b421c7097db12b45a0ec', '2026-10-27T12:55:34.680Z', '2026-10-20 12:55:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('b71dd50c-611b-4aef-baba-8f9d8aa41228', 'usr-9196724c', 'd36ad1dd004f8f2eb6b260a242978a28aedb34fd36d4484f8f10fbbbc19233e9', '2026-10-27T12:55:34.889Z', '2026-10-20 12:55:34');
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ('308e0e9d-4029-4612-a3bd-47ed266ea251', 'usr-97094607', '0bdc646bfaf6cfdbf329f85c9ea19302d591fdb5788f8c1c08a2e56b0629d888', '2026-10-27T12:55:35.018Z', '2026-10-20 12:55:35');

-- Table: user_settings
CREATE TABLE user_settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'mercury')),
      email_notifications INTEGER DEFAULT 1,
      profile_public INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    );

INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-admin-parth', 'light', 1, 1, '2026-10-20 07:06:29');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-ayesha', 'light', 1, 1, '2026-10-20 07:06:29');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-kabir', 'light', 1, 1, '2026-10-20 07:06:29');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-mei', 'light', 1, 1, '2026-10-20 07:06:29');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-nora', 'light', 1, 1, '2026-10-20 07:06:29');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-1a2a02cd', 'light', 1, 1, '2026-10-20 07:32:02');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-5dd58e4b', 'light', 1, 1, '2026-10-20 07:32:02');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-0dcba3b7', 'light', 1, 1, '2026-10-20 07:56:01');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-6788c2a6', 'light', 1, 1, '2026-10-20 07:56:01');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-9b19e8ac', 'light', 1, 1, '2026-10-20 07:56:04');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-4ab882a5', 'light', 1, 1, '2026-10-20 07:56:05');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-30cfe77f', 'light', 1, 1, '2026-10-20 07:56:05');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-334bf6a5', 'mercury', 0, 1, '2026-10-20 07:56:05');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-c6923888', 'light', 1, 1, '2026-10-20 07:57:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-1bc223a4', 'light', 1, 1, '2026-10-20 07:57:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-6d7c113c', 'light', 1, 1, '2026-10-20 07:57:38');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-8cb67e6b', 'light', 1, 1, '2026-10-20 07:57:38');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-ddb3add6', 'light', 1, 1, '2026-10-20 07:57:38');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-0dc7c690', 'mercury', 0, 1, '2026-10-20 07:57:38');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-15d1aa41', 'light', 1, 1, '2026-10-20 07:58:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-865d1581', 'light', 1, 1, '2026-10-20 07:58:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-18368ae6', 'light', 1, 1, '2026-10-20 07:58:16');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-f38d3cef', 'light', 1, 1, '2026-10-20 07:58:17');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-1e2878b2', 'light', 1, 1, '2026-10-20 07:58:17');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-e051e843', 'mercury', 0, 1, '2026-10-20 07:58:17');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-6773ab87', 'light', 1, 1, '2026-10-20 08:11:44');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-bb7465ba', 'light', 1, 1, '2026-10-20 08:11:44');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-26836243', 'light', 1, 1, '2026-10-20 08:11:48');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-258d9c44', 'light', 1, 1, '2026-10-20 08:11:48');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-cf986487', 'light', 1, 1, '2026-10-20 08:11:48');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-206484ea', 'mercury', 0, 1, '2026-10-20 08:11:48');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-7d384ef6', 'light', 1, 1, '2026-10-20 08:35:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-ddc024ae', 'light', 1, 1, '2026-10-20 08:35:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-24979f7f', 'light', 1, 1, '2026-10-20 08:35:50');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-b80e1d3e', 'light', 1, 1, '2026-10-20 08:35:50');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-f5b1f256', 'light', 1, 1, '2026-10-20 08:35:51');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-e73bcd7d', 'mercury', 0, 1, '2026-10-20 08:35:51');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-19c63d83', 'light', 1, 1, '2026-10-20 08:39:35');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-0eac25e4', 'light', 1, 1, '2026-10-20 08:39:35');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-aba7424c', 'light', 1, 1, '2026-10-20 08:39:39');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-225952dc', 'light', 1, 1, '2026-10-20 08:39:39');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-e9fed580', 'light', 1, 1, '2026-10-20 08:39:39');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-3db9f967', 'mercury', 0, 1, '2026-10-20 08:39:39');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-0571a769', 'light', 1, 1, '2026-10-20 09:00:20');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-128e7287', 'light', 1, 1, '2026-10-20 09:00:21');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-2787ac99', 'light', 1, 1, '2026-10-20 09:00:24');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-e05e9cb2', 'light', 1, 1, '2026-10-20 09:00:24');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-3f6c82c2', 'light', 1, 1, '2026-10-20 09:00:24');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-ac4c64ab', 'mercury', 0, 1, '2026-10-20 09:00:25');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-71f7ca3f', 'light', 1, 1, '2026-10-20 09:09:43');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-731014a9', 'light', 1, 1, '2026-10-20 09:09:44');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-5c994333', 'light', 1, 1, '2026-10-20 09:09:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-f8cdaf01', 'light', 1, 1, '2026-10-20 09:09:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-217811e7', 'light', 1, 1, '2026-10-20 09:09:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-9062c2ca', 'mercury', 0, 1, '2026-10-20 09:09:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-7bf07c58', 'light', 1, 1, '2026-10-20 09:10:22');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-24a19883', 'light', 1, 1, '2026-10-20 09:10:22');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-8253842d', 'light', 1, 1, '2026-10-20 09:10:25');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-4acb5d2a', 'light', 1, 1, '2026-10-20 09:10:25');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-7ad9df0c', 'light', 1, 1, '2026-10-20 09:10:25');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-3b8294d3', 'mercury', 0, 1, '2026-10-20 09:10:26');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-c05564e9', 'light', 1, 1, '2026-10-20 09:12:09');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-eba1faa1', 'light', 1, 1, '2026-10-20 09:12:09');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-6a70d6e6', 'light', 1, 1, '2026-10-20 09:12:12');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-56cef437', 'light', 1, 1, '2026-10-20 09:12:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-99fbb25c', 'light', 1, 1, '2026-10-20 09:12:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-ead70c14', 'mercury', 0, 1, '2026-10-20 09:12:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-201dcaa8', 'light', 1, 1, '2026-10-20 09:13:18');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-57b405f8', 'light', 1, 1, '2026-10-20 09:20:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-a29aa3a0', 'light', 1, 1, '2026-10-20 09:20:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-a6e8eb39', 'light', 1, 1, '2026-10-20 09:20:50');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-737926e9', 'light', 1, 1, '2026-10-20 09:20:50');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-873c4bb1', 'light', 1, 1, '2026-10-20 09:20:51');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-8246f8eb', 'mercury', 0, 1, '2026-10-20 09:20:51');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-480ade78', 'light', 1, 1, '2026-10-20 09:41:43');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-b7501abc', 'light', 1, 1, '2026-10-20 09:41:44');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-524e0b5a', 'light', 1, 1, '2026-10-20 09:41:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-e155cfd0', 'light', 1, 1, '2026-10-20 09:41:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-56826960', 'light', 1, 1, '2026-10-20 09:41:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-0e4bac5c', 'mercury', 0, 1, '2026-10-20 09:41:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-de0e71f1', 'light', 1, 1, '2026-10-20 09:59:09');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-596f2a7a', 'light', 1, 1, '2026-10-20 09:59:09');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-c3e1f6b5', 'light', 1, 1, '2026-10-20 09:59:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-1da263d4', 'light', 1, 1, '2026-10-20 09:59:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-12b9f115', 'light', 1, 1, '2026-10-20 09:59:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-9965bf7d', 'mercury', 0, 1, '2026-10-20 09:59:13');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-f827db95', 'light', 1, 1, '2026-10-20 10:00:14');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-ce837f2b', 'light', 1, 1, '2026-10-20 10:00:14');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-c419646d', 'light', 1, 1, '2026-10-20 10:00:17');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-3a068fd1', 'light', 1, 1, '2026-10-20 10:00:17');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-f8e9b589', 'light', 1, 1, '2026-10-20 10:00:18');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-bf5b0b28', 'mercury', 0, 1, '2026-10-20 10:00:18');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-100b21d5', 'light', 1, 1, '2026-10-20 10:24:30');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-3291f84a', 'light', 1, 1, '2026-10-20 10:24:30');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-481e6138', 'light', 1, 1, '2026-10-20 10:24:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-07a0383c', 'light', 1, 1, '2026-10-20 10:24:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-851e573b', 'light', 1, 1, '2026-10-20 10:24:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-98b34dbc', 'mercury', 0, 1, '2026-10-20 10:24:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-a5ce8755', 'light', 1, 1, '2026-10-20 10:25:55');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-a37255bb', 'light', 1, 1, '2026-10-20 10:25:55');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-6628001f', 'light', 1, 1, '2026-10-20 10:25:58');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-2c868f8c', 'light', 1, 1, '2026-10-20 10:25:59');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-abc1a9fa', 'light', 1, 1, '2026-10-20 10:25:59');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-214d5a75', 'mercury', 0, 1, '2026-10-20 10:25:59');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-7c7ec8ff', 'light', 1, 1, '2026-10-20 10:31:26');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-92c4d906', 'light', 1, 1, '2026-10-20 10:31:26');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-5dc98264', 'light', 1, 1, '2026-10-20 10:31:29');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-502ad689', 'light', 1, 1, '2026-10-20 10:31:30');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-217cc732', 'light', 1, 1, '2026-10-20 10:31:30');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-ac677635', 'mercury', 0, 1, '2026-10-20 10:31:30');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-85f588cc', 'light', 1, 1, '2026-10-20 10:41:11');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-8903a3f8', 'light', 1, 1, '2026-10-20 10:41:12');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-68c022ec', 'light', 1, 1, '2026-10-20 10:41:15');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-dd4e2eee', 'light', 1, 1, '2026-10-20 10:41:16');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-69aead88', 'light', 1, 1, '2026-10-20 10:41:16');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-7b9f67d7', 'mercury', 0, 1, '2026-10-20 10:41:16');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-d31446d7', 'light', 1, 1, '2026-10-20 10:44:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-d7c89a66', 'light', 1, 1, '2026-10-20 10:44:47');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-334b1c53', 'light', 1, 1, '2026-10-20 10:44:51');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-2a08125c', 'light', 1, 1, '2026-10-20 10:44:51');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-53c1a5e9', 'light', 1, 1, '2026-10-20 10:44:52');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-64ce7ecd', 'mercury', 0, 1, '2026-10-20 10:44:52');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-931a5f2c', 'light', 1, 1, '2026-10-20 10:49:15');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-9d24b4a4', 'light', 1, 1, '2026-10-20 10:49:16');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-b722fdc1', 'light', 1, 1, '2026-10-20 10:49:19');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-9abf4eb1', 'light', 1, 1, '2026-10-20 10:49:19');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-c1a3ff6a', 'light', 1, 1, '2026-10-20 10:49:20');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-80111700', 'mercury', 0, 1, '2026-10-20 10:49:20');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-8a1b9db6', 'light', 1, 1, '2026-10-20 11:12:18');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-c48a5aa8', 'light', 1, 1, '2026-10-20 11:12:19');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-db03d368', 'light', 1, 1, '2026-10-20 11:12:22');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-c4e96177', 'light', 1, 1, '2026-10-20 11:12:23');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-1e0789bb', 'light', 1, 1, '2026-10-20 11:12:23');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-11ae02b7', 'mercury', 0, 1, '2026-10-20 11:12:23');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-7c9dd1d8', 'light', 1, 1, '2026-10-20 12:55:30');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-a62809e9', 'light', 1, 1, '2026-10-20 12:55:31');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-5defa171', 'light', 1, 1, '2026-10-20 12:55:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-1db229a1', 'light', 1, 1, '2026-10-20 12:55:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-9196724c', 'light', 1, 1, '2026-10-20 12:55:34');
INSERT INTO user_settings (user_id, theme, email_notifications, profile_public, updated_at) VALUES ('usr-97094607', 'mercury', 0, 1, '2026-10-20 12:55:35');

-- Table: courses
CREATE TABLE courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      provider TEXT NOT NULL,
      level TEXT DEFAULT 'Beginner',
      external_url TEXT NOT NULL,
      duration_hours INTEGER DEFAULT 10,
      rating REAL DEFAULT 4.8,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

INSERT INTO courses (id, title, description, category, provider, level, external_url, duration_hours, rating, is_featured, created_at) VALUES ('course-cs50', 'CS50: Introduction to Computer Science', 'An introduction to the intellectual enterprises of computer science and the art of programming from Harvard University.', 'Computer Science', 'edX / Harvard', 'Beginner', 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science', 36, 4.9, 1, '2026-10-20 07:06:29');
INSERT INTO courses (id, title, description, category, provider, level, external_url, duration_hours, rating, is_featured, created_at) VALUES ('course-fcc-python', 'Scientific Computing with Python', 'Learn Python fundamentals, data structures, algorithm design, and scientific calculation from freeCodeCamp.', 'Data Science', 'freeCodeCamp', 'Beginner', 'https://www.freecodecamp.org/learn/scientific-computing-with-python/', 30, 4.8, 1, '2026-10-20 07:06:29');
INSERT INTO courses (id, title, description, category, provider, level, external_url, duration_hours, rating, is_featured, created_at) VALUES ('course-meta-frontend', 'Meta Front-End Developer Certificate', 'Professional certificate program covering HTML5, CSS3, JavaScript modern standards, React, and UX design.', 'Web Development', 'Coursera / Meta', 'Intermediate', 'https://www.coursera.org/professional-certificates/meta-front-end-developer', 45, 4.8, 1, '2026-10-20 07:06:29');
INSERT INTO courses (id, title, description, category, provider, level, external_url, duration_hours, rating, is_featured, created_at) VALUES ('course-ms-cybersecurity', 'Microsoft Cybersecurity Analyst Professional Certificate', 'Official Microsoft training for foundational network security, threat vectors, risk mitigation, and compliance.', 'Cybersecurity', 'Coursera / Microsoft', 'Beginner', 'https://www.coursera.org/professional-certificates/microsoft-cybersecurity-analyst', 40, 4.7, 1, '2026-10-20 07:06:29');
INSERT INTO courses (id, title, description, category, provider, level, external_url, duration_hours, rating, is_featured, created_at) VALUES ('course-fullstack-open', 'Full Stack Open: Deep Dive Into Modern Web Development', 'University of Helsinki''s acclaimed open curriculum on React, Redux, Node.js, REST APIs, GraphQL, and TypeScript.', 'Full Stack', 'University of Helsinki', 'Advanced', 'https://fullstackopen.com/en/', 60, 5, 1, '2026-10-20 07:06:29');
INSERT INTO courses (id, title, description, category, provider, level, external_url, duration_hours, rating, is_featured, created_at) VALUES ('course-ms-git', 'Introduction to Git and GitHub', 'Master version control, branches, pull requests, merge conflict resolution, and collaborative workflows.', 'DevOps', 'Microsoft Learn', 'Beginner', 'https://learn.microsoft.com/en-us/training/modules/introduction-to-git/', 8, 4.9, 0, '2026-10-20 07:06:29');
INSERT INTO courses (id, title, description, category, provider, level, external_url, duration_hours, rating, is_featured, created_at) VALUES ('course-docker-fcc', 'Docker and Containerization for Beginners', 'Understand container virtualization, Dockerfiles, multi-stage builds, volumes, and Docker Compose orchestration.', 'DevOps', 'freeCodeCamp', 'Intermediate', 'https://www.freecodecamp.org/news/docker-training-course-for-beginners/', 12, 4.8, 0, '2026-10-20 07:06:29');
INSERT INTO courses (id, title, description, category, provider, level, external_url, duration_hours, rating, is_featured, created_at) VALUES ('course-google-data', 'Google Data Analytics Professional Certificate', 'Gain hands-on skills in data cleaning, SQL analysis, R programming, and data storytelling.', 'Data Science', 'Coursera / Google', 'Beginner', 'https://www.coursera.org/professional-certificates/google-data-analytics', 50, 4.8, 0, '2026-10-20 07:06:29');

-- Table: lessons
CREATE TABLE lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      reading_time_mins INTEGER DEFAULT 10,
      order_index INTEGER DEFAULT 1,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

INSERT INTO lessons (id, course_id, title, slug, reading_time_mins, order_index, content, created_at) VALUES ('lesson-cs50-1', 'course-cs50', 'Computational Thinking & Algorithm Complexity', 'computational-thinking', 12, 1, '## Introduction to Computational Thinking

Computational thinking is a problem-solving methodology that breaks complex challenges into systematic steps that a machine or human can execute. It consists of four foundational pillars:

1. **Decomposition:** Breaking a large system into isolated, manageable components.
2. **Pattern Recognition:** Observing trends and shared characteristics across problems.
3. **Abstraction:** Focusing exclusively on critical data while filtering extraneous implementation noise.
4. **Algorithm Design:** Formulating an unambiguous, step-by-step sequence of instructions.

### The Anatomy of Binary Search

Consider searching for a target integer within a sorted array of $N$ items. A naive linear scan evaluates each element one by one, scaling at $O(N)$ operations in the worst case.

Binary search achieves exponential efficiency by halving the search space at each iteration:

```javascript
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const guess = arr[mid];

    if (guess === target) {
      return mid; // Target found at index
    } else if (guess > target) {
      high = mid - 1; // Discard upper half
    } else {
      low = mid + 1; // Discard lower half
    }
  }
  return -1; // Target not found
}
```

### Big-O Complexity Comparison

- **Constant Time $O(1)$:** Array index lookup, hash map key access.
- **Logarithmic Time $O(\log N)$:** Binary search, balanced tree traversal.
- **Linear Time $O(N)$:** Single pass loop over unsorted collection.
- **Quadratic Time $O(N^2)$:** Nested loops, naive bubble sort.

### Self-Check Questions
- Why must the input array be sorted before applying binary search?
- What is the maximum number of comparisons needed to find a number in a sorted array of 1,024 items? *(Answer: $\log_2(1024) = 10$)*', '2026-10-20 07:06:29');
INSERT INTO lessons (id, course_id, title, slug, reading_time_mins, order_index, content, created_at) VALUES ('lesson-cs50-2', 'course-cs50', 'Memory Layout, Pointers & Dynamic Allocation', 'memory-and-pointers', 15, 2, '## Demystifying Machine Memory

When a program executes, the operating system allocates a virtual address space partitioned into distinct segments:

- **Text/Code Segment:** The read-only compiled machine instructions.
- **Data & BSS Segments:** Global and static variables.
- **The Stack:** Function stack frames, local variables, and return addresses (managed automatically in LIFO order).
- **The Heap:** Dynamic memory allocated at runtime via system calls.

### Pointers in C / Systems Architecture

A pointer is simply a variable whose value is the memory address of another value.

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int score = 95;
    int *ptr = &score; // ptr stores address of score

    printf("Score value: %d\n", score);
    printf("Score address: %p\n", (void*)ptr);
    printf("Dereferenced: %d\n", *ptr);

    // Dynamic allocation on the heap
    int *dynamicArray = malloc(5 * sizeof(int));
    if (dynamicArray == NULL) {
        return 1; // Out of memory safeguard
    }

    for (int i = 0; i < 5; i++) {
        dynamicArray[i] = (i + 1) * 10;
    }

    // Critical: release memory to prevent leaks
    free(dynamicArray);
    return 0;
}
```

### Common Memory Vulnerabilities
- **Buffer Overflow:** Writing past the allocated memory boundary, corrupting adjacent stack frames.
- **Dangling Pointer:** Accessing memory after calling `free()`.
- **Memory Leak:** Allocating heap memory without corresponding `free()` calls, exhausting available RAM over time.', '2026-10-20 07:06:29');
INSERT INTO lessons (id, course_id, title, slug, reading_time_mins, order_index, content, created_at) VALUES ('lesson-web-1', 'course-meta-frontend', 'Modern JavaScript: The Event Loop & Async Mechanics', 'javascript-event-loop', 14, 1, '## JavaScript Concurrency Model

JavaScript is a single-threaded runtime environment equipped with a non-blocking, asynchronous event-driven I/O engine. How does a single thread execute long network requests without freezing the user interface?

The answer lies in the interaction between:
1. **The Call Stack:** Executes synchronous frames.
2. **Web APIs / Node C++ APIs:** Handles background timers, HTTP requests, and disk I/O.
3. **The Microtask Queue:** High-priority queue for Promise resolutions (`.then()`, `await`, `queueMicrotask`).
4. **The Macrotask Queue:** General task queue for `setTimeout`, `setInterval`, and DOM events.

### Microtasks vs. Macrotasks

```javascript
console.log(''1: Synchronous Start'');

setTimeout(() => {
  console.log(''4: Macrotask Timer'');
}, 0);

Promise.resolve().then(() => {
  console.log(''3: Microtask Promise'');
});

console.log(''2: Synchronous End'');

// Execution Output:
// 1: Synchronous Start
// 2: Synchronous End
// 3: Microtask Promise
// 4: Macrotask Timer
```

Notice that even though `setTimeout` had a delay of `0ms`, the microtask queue was completely drained before the macrotask was allowed onto the call stack.

### Clean Async/Await Error Handling Pattern

```javascript
async function fetchUserProfile(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(''Fetch failed:'', error.message);
    return { success: false, error: error.message };
  }
}
```', '2026-10-20 07:06:29');
INSERT INTO lessons (id, course_id, title, slug, reading_time_mins, order_index, content, created_at) VALUES ('lesson-sec-1', 'course-ms-cybersecurity', 'Web Application Security: OWASP Top 10 Defences', 'web-security-owasp', 16, 1, '## Building Resilient Web Architectures

Security is not an afterthought or a final plugin; it is a discipline baked into database design, API authentication, and input sanitization.

### 1. SQL Injection (SQLi)

SQL injection occurs when unvalidated user input is concatenated directly into query strings.

**Vulnerable:**
```javascript
// NEVER DO THIS:
const query = `SELECT * FROM users WHERE email = ''${req.body.email}''`;
```

**Secure (Parameterized Queries):**
```javascript
// Bound parameters are never parsed as SQL syntax:
const stmt = db.prepare(''SELECT * FROM users WHERE email = ?'');
const user = stmt.get(req.body.email);
```

### 2. Cross-Site Scripting (XSS)

XSS occurs when an application includes untrusted data in a web page without proper escaping or encoding.

- **Stored XSS:** Malicious script is saved in the database and served to other users.
- **Reflected XSS:** Injected script is reflected off the web server in an immediate error or search result.
- **Mitigation:** Use text-node interpolation (`textContent` over `innerHTML`), set a strict `Content-Security-Policy` header, and use `HttpOnly` cookie flags for session identifiers.

### 3. Broken Access Control (IDOR)

Insecure Direct Object References happen when an endpoint accepts an ID from the client and modifies the object without verifying that the authenticated user owns that resource.

```javascript
// Always verify ownership in the query constraint:
const stmt = db.prepare(
  ''UPDATE projects SET title = ? WHERE id = ? AND user_id = ?''
);
const result = stmt.run(newTitle, projectId, req.user.id);
if (result.changes === 0) {
  return res.status(403).json({ error: ''Unauthorized or project not found'' });
}
```', '2026-10-20 07:06:29');

-- Table: lesson_progress
CREATE TABLE lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
      reading_seconds INTEGER DEFAULT 0,
      completed_at TEXT,
      UNIQUE(user_id, lesson_id)
    );

INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('c0414d9c-0b8a-4749-bb17-bba55b32e17d', 'usr-5dd58e4b', 'lesson-cs50-1', 'completed', 60, '2026-10-20T07:32:02.931Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('85df8f64-d1fd-4bb5-9215-872f94e78d2e', 'usr-6788c2a6', 'lesson-cs50-1', 'completed', 60, '2026-10-20T07:56:01.677Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('63a273fc-d1e4-4b95-924c-a9c3f83cfcc5', 'usr-1bc223a4', 'lesson-cs50-1', 'completed', 30, '2026-10-20T07:57:35.013Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('b2e1fa80-0ad4-469a-8517-bac2a6f51daa', 'usr-865d1581', 'lesson-cs50-1', 'completed', 60, '2026-10-20T07:58:13.811Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('6beb1be8-290b-4921-ad8a-0fd68637eed1', 'usr-bb7465ba', 'lesson-cs50-1', 'completed', 60, '2026-10-20T08:11:44.988Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('00099430-a2c5-409e-a28a-bdcf0ca6d446', 'usr-ddc024ae', 'lesson-cs50-1', 'completed', 60, '2026-10-20T08:35:47.590Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('d08accf8-a325-4ec9-8b38-5ef636956a0f', 'usr-0eac25e4', 'lesson-cs50-1', 'completed', 60, '2026-10-20T08:39:35.797Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('4a33d8e7-1487-4937-8809-10dfce8c64ce', 'usr-128e7287', 'lesson-cs50-1', 'completed', 60, '2026-10-20T09:00:21.200Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('e6079d5e-6374-4045-b628-de427364489c', 'usr-731014a9', 'lesson-cs50-1', 'completed', 60, '2026-10-20T09:09:44.140Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('bf8f1591-087f-481c-b6e6-65cf6355f37f', 'usr-24a19883', 'lesson-cs50-1', 'completed', 60, '2026-10-20T09:10:22.480Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('cd68e1f9-3c61-479e-b701-2a602f9f756b', 'usr-eba1faa1', 'lesson-cs50-1', 'completed', 60, '2026-10-20T09:12:09.725Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('f12ec7f2-7a72-4793-92a0-51fefd7e81e2', 'usr-a29aa3a0', 'lesson-cs50-1', 'completed', 60, '2026-10-20T09:20:47.601Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('0294103b-0369-477a-82f5-92fa682bd173', 'usr-b7501abc', 'lesson-cs50-1', 'completed', 60, '2026-10-20T09:41:44.034Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('491c0424-2284-46db-b24a-aa0f0e8ac5d7', 'usr-596f2a7a', 'lesson-cs50-1', 'completed', 60, '2026-10-20T09:59:10.029Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('93129ff0-15bf-48a6-bb00-cf09abb3e8ef', 'usr-ce837f2b', 'lesson-cs50-1', 'completed', 60, '2026-10-20T10:00:14.489Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('8f2ed132-469a-4e35-acde-afe97c9086f2', 'usr-3291f84a', 'lesson-cs50-1', 'completed', 60, '2026-10-20T10:24:30.874Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('4fca3bb1-483d-4de3-a25c-7ce8feec9efe', 'usr-a37255bb', 'lesson-cs50-1', 'completed', 60, '2026-10-20T10:25:55.774Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('853c0782-585d-4f2c-bd56-7c4977f05af3', 'usr-92c4d906', 'lesson-cs50-1', 'completed', 60, '2026-10-20T10:31:26.810Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('31451b32-f941-4da1-a808-6c2f41fe6722', 'usr-8903a3f8', 'lesson-cs50-1', 'completed', 60, '2026-10-20T10:41:12.460Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('9906fd6a-22d1-4f03-a178-3855aa086e77', 'usr-d7c89a66', 'lesson-cs50-1', 'completed', 60, '2026-10-20T10:44:47.996Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('1759b6d0-532d-4bde-a2df-70631b7d1f9c', 'usr-9d24b4a4', 'lesson-cs50-1', 'completed', 60, '2026-10-20T10:49:16.309Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('60829b2f-6962-4739-a049-e9147e9a79a0', 'usr-c48a5aa8', 'lesson-cs50-1', 'completed', 60, '2026-10-20T11:12:19.367Z');
INSERT INTO lesson_progress (id, user_id, lesson_id, status, reading_seconds, completed_at) VALUES ('1c0f5e6c-9461-4fa5-b73b-83fef1e1a395', 'usr-a62809e9', 'lesson-cs50-1', 'completed', 60, '2026-10-20T12:55:31.240Z');

-- Table: challenges
CREATE TABLE challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
      category TEXT NOT NULL,
      time_estimate TEXT DEFAULT '20 min',
      description TEXT NOT NULL,
      examples_json TEXT NOT NULL DEFAULT '[]',
      starter_code_js TEXT NOT NULL,
      solution_template TEXT DEFAULT '',
      public_tests_json TEXT NOT NULL DEFAULT '[]',
      hidden_tests_json TEXT NOT NULL DEFAULT '[]',
      xp_reward INTEGER DEFAULT 25,
      created_at TEXT DEFAULT (datetime('now'))
    );

INSERT INTO challenges (id, title, slug, difficulty, category, time_estimate, description, examples_json, starter_code_js, solution_template, public_tests_json, hidden_tests_json, xp_reward, created_at) VALUES ('challenge-two-sum', 'Two Sum', 'two-sum', 'Easy', 'Arrays', '15 min', 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. Return the answer as `[index1, index2]` sorted ascending.', '[{"input":"nums = [2,7,11,15], target = 9","output":"[0,1]","explanation":"Because nums[0] + nums[1] == 9, we return [0, 1]."},{"input":"nums = [3,2,4], target = 6","output":"[1,2]"}]', 'function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}', '', '[{"args":[[2,7,11,15],9],"expected":[0,1]},{"args":[[3,2,4],6],"expected":[1,2]}]', '[{"args":[[3,3],6],"expected":[0,1]},{"args":[[1,5,7,11,19],20],"expected":[0,4]},{"args":[[-3,4,3,90],0],"expected":[0,2]}]', 25, '2026-10-20 07:06:29');
INSERT INTO challenges (id, title, slug, difficulty, category, time_estimate, description, examples_json, starter_code_js, solution_template, public_tests_json, hidden_tests_json, xp_reward, created_at) VALUES ('challenge-valid-parentheses', 'Valid Parentheses', 'valid-parentheses', 'Easy', 'Stacks', '15 min', 'Given a string `s` containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.
An input string is valid if open brackets are closed by the same type of brackets and in the correct order.', '[{"input":"s = \"()[]{}\"","output":"true"},{"input":"s = \"(]\"","output":"false"}]', 'function isValid(s) {
  const stack = [];
  const pairs = { '')'': ''('', ''}'': ''{'', '']'': ''['' };
  for (const ch of s) {
    if (ch === ''('' || ch === ''{'' || ch === ''['') {
      stack.push(ch);
    } else {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}', '', '[{"args":["()[]{}"],"expected":true},{"args":["(]"],"expected":false}]', '[{"args":["{[]}"],"expected":true},{"args":["["],"expected":false},{"args":[""],"expected":true},{"args":[")("],"expected":false}]', 25, '2026-10-20 07:06:29');
INSERT INTO challenges (id, title, slug, difficulty, category, time_estimate, description, examples_json, starter_code_js, solution_template, public_tests_json, hidden_tests_json, xp_reward, created_at) VALUES ('challenge-maximum-subarray', 'Maximum Subarray Sum', 'maximum-subarray-sum', 'Medium', 'Dynamic Programming', '25 min', 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum (Kadane''s Algorithm).', '[{"input":"nums = [-2,1,-3,4,-1,2,1,-5,4]","output":"6","explanation":"[4,-1,2,1] has the largest sum = 6."}]', 'function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}', '', '[{"args":[[-2,1,-3,4,-1,2,1,-5,4]],"expected":6},{"args":[[1]],"expected":1}]', '[{"args":[[5,4,-1,7,8]],"expected":23},{"args":[[-1,-2,-3]],"expected":-1}]', 35, '2026-10-20 07:06:29');
INSERT INTO challenges (id, title, slug, difficulty, category, time_estimate, description, examples_json, starter_code_js, solution_template, public_tests_json, hidden_tests_json, xp_reward, created_at) VALUES ('challenge-reverse-linked-list', 'Reverse a Linked List', 'reverse-linked-list', 'Easy', 'Queues', '20 min', 'Given the head of a singly linked list represented as an array of values, return the reversed list as an array of values.', '[{"input":"head = [1,2,3,4,5]","output":"[5,4,3,2,1]"}]', 'function reverseList(arr) {
  // In our sandbox, linked lists are passed/returned as ordered arrays of values
  const result = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]);
  }
  return result;
}', '', '[{"args":[[1,2,3,4,5]],"expected":[5,4,3,2,1]},{"args":[[1,2]],"expected":[2,1]}]', '[{"args":[[]],"expected":[]},{"args":[[42]],"expected":[42]}]', 25, '2026-10-20 07:06:29');
INSERT INTO challenges (id, title, slug, difficulty, category, time_estimate, description, examples_json, starter_code_js, solution_template, public_tests_json, hidden_tests_json, xp_reward, created_at) VALUES ('challenge-binary-search', 'Binary Search', 'binary-search', 'Easy', 'Arrays', '15 min', 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If target exists, return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.', '[{"input":"nums = [-1,0,3,5,9,12], target = 9","output":"4"},{"input":"nums = [-1,0,3,5,9,12], target = 2","output":"-1"}]', 'function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}', '', '[{"args":[[-1,0,3,5,9,12],9],"expected":4},{"args":[[-1,0,3,5,9,12],2],"expected":-1}]', '[{"args":[[5],5],"expected":0},{"args":[[1,3,5,7,9,11,13],13],"expected":6},{"args":[[1,3,5,7,9,11,13],1],"expected":0}]', 25, '2026-10-20 07:06:29');
INSERT INTO challenges (id, title, slug, difficulty, category, time_estimate, description, examples_json, starter_code_js, solution_template, public_tests_json, hidden_tests_json, xp_reward, created_at) VALUES ('challenge-min-stack', 'Min Stack', 'min-stack', 'Medium', 'Stacks', '30 min', 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1). In this challenge, given an array of operations ["push", "push", "getMin", ...] and arguments, return the array of outputs.', '[{"input":"operations = [\"push\", \"push\", \"push\", \"getMin\", \"pop\", \"top\", \"getMin\"], args = [[-2], [0], [-3], [], [], [], []]","output":"[null, null, null, -3, null, 0, -2]"}]', 'function minStackDriver(ops, args) {
  const stack = [];
  const minStack = [];
  const output = [];

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (op === ''push'') {
      const val = args[i][0];
      stack.push(val);
      if (minStack.length === 0 || val <= minStack[minStack.length - 1]) {
        minStack.push(val);
      }
      output.push(null);
    } else if (op === ''pop'') {
      const val = stack.pop();
      if (val === minStack[minStack.length - 1]) {
        minStack.pop();
      }
      output.push(null);
    } else if (op === ''top'') {
      output.push(stack[stack.length - 1]);
    } else if (op === ''getMin'') {
      output.push(minStack[minStack.length - 1]);
    }
  }
  return output;
}', '', '[{"args":[["push","push","push","getMin","pop","top","getMin"],[[-2],[0],[-3],[],[],[],[]]],"expected":[null,null,null,-3,null,0,-2]}]', '[{"args":[["push","push","getMin","top"],[[1],[2],[],[]]],"expected":[null,null,1,2]}]', 35, '2026-10-20 07:06:29');

-- Table: submissions
CREATE TABLE submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      language TEXT DEFAULT 'javascript',
      status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'error', 'timeout')),
      execution_time_ms INTEGER DEFAULT 0,
      passed_tests INTEGER DEFAULT 0,
      total_tests INTEGER DEFAULT 0,
      error_message TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('e9bf47d6-bb99-4460-9551-ff516b593d09', 'usr-9b19e8ac', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'failed', 5, 4, 5, '', '2026-10-20 07:56:04');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('42f47158-9775-4d6a-bbe1-8a62835addc1', 'usr-6d7c113c', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 4, 5, 5, '', '2026-10-20 07:57:38');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('7d574e22-b6e0-4851-ba27-683318d0306c', 'usr-18368ae6', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 07:58:16');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('a1ef002e-0f04-4d5d-b603-1adade0da584', 'usr-18368ae6', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 07:58:17');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('4858c0b4-1512-4016-a42c-70d5235f555b', 'usr-26836243', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 10, 5, 5, '', '2026-10-20 08:11:48');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('19e34977-1bff-457f-a699-d3110a51acad', 'usr-26836243', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 08:11:48');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('5fafb104-d86f-4f00-85f5-83fde7589ec7', 'usr-24979f7f', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 4, 5, 5, '', '2026-10-20 08:35:50');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('5280a10e-bbc9-4200-98fb-c6b07af45853', 'usr-24979f7f', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 8, 5, 5, '', '2026-10-20 08:35:50');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('f1d04e23-c1d2-4c3f-8e9b-02504ba4bd11', 'usr-aba7424c', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 6, 5, 5, '', '2026-10-20 08:39:39');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('97b3f918-9f35-4a73-9772-11de3c263403', 'usr-aba7424c', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 6, 5, 5, '', '2026-10-20 08:39:39');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('915306ff-47f8-45df-8a6b-965eaa673003', 'usr-2787ac99', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 7, 5, 5, '', '2026-10-20 09:00:24');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('1f03beb5-30a0-42a8-8606-5fc87001e6da', 'usr-2787ac99', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 8, 5, 5, '', '2026-10-20 09:00:24');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('ad8aa2db-c063-4497-acdf-89567ceac46d', 'usr-5c994333', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 09:09:47');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('75d70e0a-5ee1-46f6-b4fe-cb8ccb9ec37c', 'usr-5c994333', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 09:09:47');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('16da88ee-5097-4e4f-86e9-038a6de16b3c', 'usr-8253842d', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 4, 5, 5, '', '2026-10-20 09:10:25');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('5bb50752-ad35-450b-bc24-00ad78283738', 'usr-8253842d', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 4, 5, 5, '', '2026-10-20 09:10:25');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('dd2d78a5-e896-428e-abbd-44d59d1a4d47', 'usr-6a70d6e6', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 11, 5, 5, '', '2026-10-20 09:12:12');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('fd69506b-8967-4fca-8a65-fcd68d547791', 'usr-6a70d6e6', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 7, 5, 5, '', '2026-10-20 09:12:12');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('78354c3c-8796-4fe0-bd71-b1e676cec065', 'usr-a6e8eb39', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 8, 5, 5, '', '2026-10-20 09:20:50');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('44ae352a-88eb-4390-bc7d-abbd970560c7', 'usr-a6e8eb39', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 09:20:50');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('cbe6bb91-8288-4d60-b4c0-33d8c8676d8a', 'usr-524e0b5a', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 4, 5, 5, '', '2026-10-20 09:41:47');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('7d4ac1b2-44ca-43e1-9b44-e72b23de1aa5', 'usr-524e0b5a', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 09:41:47');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('65441c47-55a1-4354-ac53-bc7bd608b137', 'usr-c3e1f6b5', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 31, 5, 5, '', '2026-10-20 09:59:13');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('b2b40d79-4f2e-4c96-8c77-b71bd63a7030', 'usr-c3e1f6b5', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 6, 5, 5, '', '2026-10-20 09:59:13');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('d06a8d1c-809a-4dd6-8daf-8c1f97679c5c', 'usr-c419646d', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 7, 5, 5, '', '2026-10-20 10:00:17');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('9137ae6d-ac99-4a2b-aa0a-6fc1a592ff78', 'usr-c419646d', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 6, 5, 5, '', '2026-10-20 10:00:17');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('79150d44-f606-4aff-af53-c78cc8af4dc5', 'usr-481e6138', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 4, 5, 5, '', '2026-10-20 10:24:34');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('dcdc0c94-e539-40ab-b2c2-4a795a79bc16', 'usr-481e6138', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 3, 5, 5, '', '2026-10-20 10:24:34');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('2045f8a9-9e15-4d05-b29d-e51903c570bc', 'usr-6628001f', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 10:25:58');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('c7646fe0-15ee-48fe-a44f-95e323abade5', 'usr-6628001f', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 10:25:58');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('e5c92b75-282e-43aa-b58b-2edb93e40b7c', 'usr-5dc98264', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 4, 5, 5, '', '2026-10-20 10:31:30');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('f12bba31-0e6e-4e6f-892e-ecb7b228db5b', 'usr-5dc98264', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 6, 5, 5, '', '2026-10-20 10:31:30');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('e1fc8fc7-0a3a-4738-a6b4-6e4cc9cb0379', 'usr-68c022ec', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 12, 5, 5, '', '2026-10-20 10:41:15');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('12b7a780-d615-4c7c-8169-f8904758bb45', 'usr-68c022ec', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 6, 5, 5, '', '2026-10-20 10:41:15');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('bf7a3aa6-fe6c-4d24-a2ec-aeaac989e8c8', 'usr-334b1c53', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 20, 5, 5, '', '2026-10-20 10:44:51');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('57065d46-7988-41d1-be70-4e24f01c6403', 'usr-334b1c53', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 15, 5, 5, '', '2026-10-20 10:44:51');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('f4908581-e1cf-48c8-b8d9-cc13bc1a14c5', 'usr-b722fdc1', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 10, 5, 5, '', '2026-10-20 10:49:19');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('384047d4-6338-4fff-86f5-239f916847d2', 'usr-b722fdc1', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 14, 5, 5, '', '2026-10-20 10:49:19');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('031269e1-86c0-4c87-8f34-235b9587ec7c', 'usr-db03d368', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 234, 5, 5, '', '2026-10-20 11:12:23');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('9bd7dd53-ab68-4dcc-a7cc-046147d50e1e', 'usr-db03d368', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 17, 5, 5, '', '2026-10-20 11:12:23');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('00228f78-a180-4ae2-9e87-f96b71cd495c', 'usr-5defa171', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 12:55:34');
INSERT INTO submissions (id, user_id, challenge_id, code, language, status, execution_time_ms, passed_tests, total_tests, error_message, created_at) VALUES ('51c5d2f0-0389-49e0-a4a6-ea6b91f61f4b', 'usr-5defa171', 'challenge-two-sum', '
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  ', 'javascript', 'passed', 5, 5, 5, '', '2026-10-20 12:55:34');

-- Table: xp_ledger
CREATE TABLE xp_ledger (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL CHECK (amount > 0),
      source_type TEXT NOT NULL CHECK (source_type IN ('lesson_complete', 'challenge_pass', 'project_submit', 'achievement_unlock', 'streak_bonus')),
      reference_id TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, source_type, reference_id)
    );

INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('2400725c-b071-4f48-9959-095ffe7884e7', 'usr-ayesha', 17120, 'challenge_pass', 'challenge-two-sum', 'Sample seed achievement', '2026-10-18 07:06:29');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e9898e94-7474-4eb3-a982-9cdc85c3a2c3', 'usr-kabir', 15900, 'challenge_pass', 'challenge-two-sum', 'Sample seed achievement', '2026-10-18 07:06:29');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('2dd705e4-e603-45c6-aaee-117ca0d1e063', 'usr-mei', 18400, 'challenge_pass', 'challenge-two-sum', 'Sample seed achievement', '2026-10-18 07:06:29');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f1d76198-af47-4ade-9ced-238e18d733f4', 'usr-nora', 13300, 'challenge_pass', 'challenge-two-sum', 'Sample seed achievement', '2026-10-18 07:06:29');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('dacaabf9-bb73-42d0-a7fb-63f5c5972dab', 'usr-5dd58e4b', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 07:32:02');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('35bd72fc-09c0-4a75-98d0-a191b08d60df', 'usr-5dd58e4b', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 07:32:02');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c7d4f62b-9233-4f18-ab97-fd3aba68fd87', 'usr-6788c2a6', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 07:56:01');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('ef10dfb6-dcc2-4536-b095-ac30ba4bd4d7', 'usr-6788c2a6', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 07:56:01');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('6de27bc9-e53f-4fc9-a5bc-6a15e607bdcd', 'usr-4ab882a5', 50, 'project_submit', 'prj-8ad18c9b', 'Submitted project: Pulse Analytics', '2026-10-20 07:56:05');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0c7c1fb6-6993-40a4-882a-c31deec506c4', 'usr-4ab882a5', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 07:56:05');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('91f03661-8169-4306-a3a6-5c6726e8fbda', 'usr-4ab882a5', 5, 'project_submit', 'vote-prj-8ad18c9b', 'Voted on community project', '2026-10-20 07:56:05');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('6f0cb940-0a3d-4c59-9493-f2cfeb5c82d2', 'usr-4ab882a5', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 07:56:05');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('3747508e-1f06-4526-b2ab-93d2084c446f', 'usr-1bc223a4', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 07:57:35');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d0a12a34-caf0-44f2-9d4f-f1e7137c9b84', 'usr-1bc223a4', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 07:57:35');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('5fd151f8-ab3f-47bf-83d4-23752e09c4c8', 'usr-6d7c113c', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 07:57:38');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('2bdd602b-5536-428d-acfa-4038e257c111', 'usr-6d7c113c', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 07:57:38');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e66c9d45-f6f9-4632-9444-44ab94489fdb', 'usr-8cb67e6b', 50, 'project_submit', 'prj-35377187', 'Submitted project: Pulse Analytics', '2026-10-20 07:57:38');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('ff71e17a-d489-48a3-bde2-b21f39be1a43', 'usr-8cb67e6b', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 07:57:38');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('5169d847-9f8e-471b-aa1b-9640af8fb0ee', 'usr-8cb67e6b', 5, 'project_submit', 'vote-prj-35377187', 'Voted on community project', '2026-10-20 07:57:38');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a2cae553-e634-4d6d-a51a-175a80d50966', 'usr-8cb67e6b', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 07:57:38');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('fe5a30d4-dbea-4039-9d1a-045b0fa0f40d', 'usr-865d1581', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 07:58:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('dea06769-12e6-4663-a5a5-6162b758766e', 'usr-865d1581', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 07:58:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('66c823af-6fb8-475b-8734-2a27113905a8', 'usr-18368ae6', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 07:58:16');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('facd7abf-a39d-4733-ae07-72c56e1d4f1d', 'usr-18368ae6', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 07:58:16');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('1499a5ad-d788-4a4e-a86d-ebf380f90f86', 'usr-f38d3cef', 50, 'project_submit', 'prj-5402e90e', 'Submitted project: Pulse Analytics', '2026-10-20 07:58:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('7898a109-64ec-4cf3-a314-da28e7c3218d', 'usr-f38d3cef', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 07:58:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('939d3a0e-9674-4df2-b091-977f78aaacec', 'usr-f38d3cef', 5, 'project_submit', 'vote-prj-5402e90e', 'Voted on community project', '2026-10-20 07:58:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('1c427946-3805-4f4a-ac01-7be7e087b5ed', 'usr-f38d3cef', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 07:58:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('efeabaf2-e18d-47b9-a51e-9e372b428b09', 'usr-bb7465ba', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 08:11:44');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('6f0e20af-11ed-42e4-a80f-19c3758ccdb7', 'usr-bb7465ba', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 08:11:44');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d98e8590-90c3-42a3-bf6b-4d60b77e972e', 'usr-26836243', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 08:11:48');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('096fc25f-53ff-4d43-b59d-49ce885471df', 'usr-26836243', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 08:11:48');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a3df7188-a1bc-4785-a290-33d49b56811f', 'usr-258d9c44', 50, 'project_submit', 'prj-297c98a5', 'Submitted project: Pulse Analytics', '2026-10-20 08:11:48');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('49c7b8c1-b897-46ca-b84d-14e9c7fbaaff', 'usr-258d9c44', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 08:11:48');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('9d6a2ea4-d83f-46a8-a2a3-3eb233faba10', 'usr-258d9c44', 5, 'project_submit', 'vote-prj-297c98a5', 'Voted on community project', '2026-10-20 08:11:48');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('b6f4ce7c-51e5-4507-b3e0-6af4278a189f', 'usr-258d9c44', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 08:11:48');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c4dcce23-ec90-43d7-9074-6695739b3d0f', 'usr-ddc024ae', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 08:35:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d8549d81-259a-449e-9f38-e5e7edd9afe6', 'usr-ddc024ae', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 08:35:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a325475f-ca6f-4084-8771-acf1f696699c', 'usr-24979f7f', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 08:35:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('1afb460e-8ade-4eb6-9528-41f6986af5ea', 'usr-24979f7f', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 08:35:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('87cc5a59-9e10-43e1-979e-1461c91e67fd', 'usr-b80e1d3e', 50, 'project_submit', 'prj-6b70ff26', 'Submitted project: Pulse Analytics', '2026-10-20 08:35:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('4ff4e237-4d1c-4405-b1b3-30973e673a64', 'usr-b80e1d3e', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 08:35:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('dad4e417-3cdf-488f-b935-75247641751a', 'usr-b80e1d3e', 5, 'project_submit', 'vote-prj-6b70ff26', 'Voted on community project', '2026-10-20 08:35:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('ad0785df-17ae-4b86-bb39-382a2afec6a6', 'usr-b80e1d3e', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 08:35:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0a72af9a-63cf-4d5f-bad8-eeca2f898be8', 'usr-0eac25e4', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 08:39:35');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('03d4e5a4-9c3c-4f40-9158-dbe6d9d84ad1', 'usr-0eac25e4', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 08:39:35');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('949bd1d6-dbb1-497d-a2ec-274fc6e1f5ff', 'usr-aba7424c', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 08:39:39');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a13ff6fd-fed2-4e16-86ff-844f0391aeba', 'usr-aba7424c', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 08:39:39');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('713596a7-a0da-4d60-b878-6354e6e39a3d', 'usr-225952dc', 50, 'project_submit', 'prj-4af03a5c', 'Submitted project: Pulse Analytics', '2026-10-20 08:39:39');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('96e1cd5d-4fbe-43a9-816a-527e9cc0e42c', 'usr-225952dc', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 08:39:39');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('5805a10b-a417-42ca-aa5a-1ae3e3cd3001', 'usr-225952dc', 5, 'project_submit', 'vote-prj-4af03a5c', 'Voted on community project', '2026-10-20 08:39:39');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('1310d2a0-de46-4a84-9d34-e77adfded94c', 'usr-225952dc', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 08:39:39');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('011c24b1-1a55-4367-9241-8c124b4dd09a', 'usr-128e7287', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 09:00:21');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0bc6eafc-d2bc-48a9-a217-34dbd076d505', 'usr-128e7287', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 09:00:21');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c974830e-2c4e-4ade-baa7-81730598ea76', 'usr-2787ac99', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 09:00:24');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c4232cb4-86ca-4513-8e8f-effaf63ace9c', 'usr-2787ac99', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 09:00:24');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('90df1de8-d7d1-4e2e-83bb-6f4d1b4c2340', 'usr-e05e9cb2', 50, 'project_submit', 'prj-12a99877', 'Submitted project: Pulse Analytics', '2026-10-20 09:00:24');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('74e80b7e-0d68-4ce9-9fab-6bf1ead13a0b', 'usr-e05e9cb2', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 09:00:24');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('3ebf36cb-1cd6-47b3-9714-e2ffa5da2021', 'usr-e05e9cb2', 5, 'project_submit', 'vote-prj-12a99877', 'Voted on community project', '2026-10-20 09:00:24');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0c9fddc8-77c9-48f5-84ce-c19d881bc62e', 'usr-e05e9cb2', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 09:00:24');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('feb650ee-48e2-4940-82f0-afe98788ac31', 'usr-731014a9', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 09:09:44');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c2949c95-ed2c-418e-99f2-0073c8d08a1b', 'usr-731014a9', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 09:09:44');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f57c64a5-8365-49ef-8f22-55ffa97db40e', 'usr-5c994333', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 09:09:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('b14fac56-835b-4e88-8d11-55ba4bf5bf9a', 'usr-5c994333', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 09:09:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('3cf56bdf-97d4-4273-8829-8dfcd4a6c8b1', 'usr-f8cdaf01', 50, 'project_submit', 'prj-bde95dbb', 'Submitted project: Pulse Analytics', '2026-10-20 09:09:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f2973574-3fcc-4c0f-8087-92c62f8795a1', 'usr-f8cdaf01', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 09:09:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('579e131e-2f52-4fe5-86ed-85a0cda7ec0f', 'usr-f8cdaf01', 5, 'project_submit', 'vote-prj-bde95dbb', 'Voted on community project', '2026-10-20 09:09:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('74674b29-4d62-4408-b8b4-a5fae6c285d9', 'usr-f8cdaf01', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 09:09:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('17b18909-0bfb-4e3f-b303-589f6e9b3d1b', 'usr-24a19883', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 09:10:22');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('312ca080-0a1e-4d61-9a74-808e1c28bdeb', 'usr-24a19883', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 09:10:22');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f596a87d-7e27-4a57-9e46-e16277139cf9', 'usr-8253842d', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 09:10:25');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('358b3a26-9036-44d4-a0d0-b2bbb0de9e93', 'usr-8253842d', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 09:10:25');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0e2d58d7-e375-41ec-b295-26cdc1c000d9', 'usr-4acb5d2a', 50, 'project_submit', 'prj-4a5cc5fd', 'Submitted project: Pulse Analytics', '2026-10-20 09:10:25');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('5208234d-41a9-4373-8d00-7551846c4ea1', 'usr-4acb5d2a', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 09:10:25');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('1c610a83-f50e-4548-bf20-e3de14610911', 'usr-4acb5d2a', 5, 'project_submit', 'vote-prj-4a5cc5fd', 'Voted on community project', '2026-10-20 09:10:25');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('36a83e9a-93fe-4f6b-aa10-d2f5530d1ada', 'usr-4acb5d2a', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 09:10:25');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d3175ea5-beb0-4c19-8552-ed919ddd97d1', 'usr-eba1faa1', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 09:12:09');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('89d5aa3f-2ecb-4ff5-b036-e3b7e9a4581b', 'usr-eba1faa1', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 09:12:09');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a77cdb2d-a0e2-40bf-8677-719b0a47ef65', 'usr-6a70d6e6', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 09:12:12');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d7d6b39e-12ff-4ddb-9fce-db8bc77b6246', 'usr-6a70d6e6', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 09:12:12');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('986e18b7-0ce5-4797-be1d-ff96660a5cbb', 'usr-56cef437', 50, 'project_submit', 'prj-22a5e15c', 'Submitted project: Pulse Analytics', '2026-10-20 09:12:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('8687041e-a821-43bc-a684-04fcd294b1c2', 'usr-56cef437', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 09:12:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e6bd3a82-3075-48d1-8d76-c555393457dc', 'usr-56cef437', 5, 'project_submit', 'vote-prj-22a5e15c', 'Voted on community project', '2026-10-20 09:12:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('9f9cdf08-839e-44b5-a834-794b1d830ddc', 'usr-56cef437', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 09:12:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('ac95771e-211a-4850-8a86-ce033ff49b78', 'usr-a29aa3a0', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 09:20:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c04b3ccd-b078-4c6f-93d8-a62515a8eee1', 'usr-a29aa3a0', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 09:20:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('ec1cd75d-7625-4cdb-8f28-7bb121c178ed', 'usr-a6e8eb39', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 09:20:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('83b1b46c-79c1-4a63-b04c-2156ce70e8ca', 'usr-a6e8eb39', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 09:20:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('2b296e8f-8fd1-47dd-a5a2-6f3f26a0db65', 'usr-737926e9', 50, 'project_submit', 'prj-6fe76da4', 'Submitted project: Pulse Analytics', '2026-10-20 09:20:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a7019a17-7d11-45c4-8174-76e807ffed37', 'usr-737926e9', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 09:20:50');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('5907c1b5-dbcc-4029-82e7-8600609372fc', 'usr-737926e9', 5, 'project_submit', 'vote-prj-6fe76da4', 'Voted on community project', '2026-10-20 09:20:51');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('97f6d368-2537-420e-a111-20472c6258f9', 'usr-737926e9', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 09:20:51');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('b543ee63-82ef-4404-a713-d1a98406ffae', 'usr-b7501abc', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 09:41:44');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('aad40828-ca04-4a7f-b3e9-b830393cb0a5', 'usr-b7501abc', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 09:41:44');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a5591890-042c-4078-91a1-65d334809e96', 'usr-524e0b5a', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 09:41:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('06495a04-1d32-4c42-8762-1175078a1263', 'usr-524e0b5a', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 09:41:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d04ec5f9-7d5f-472f-b99b-f69d90fc4295', 'usr-e155cfd0', 50, 'project_submit', 'prj-ca7128f1', 'Submitted project: Pulse Analytics', '2026-10-20 09:41:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c646e260-2cc4-41b2-bb87-192bcecd4857', 'usr-e155cfd0', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 09:41:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e629e982-cd72-4ba5-a58e-1b314b95c142', 'usr-e155cfd0', 5, 'project_submit', 'vote-prj-ca7128f1', 'Voted on community project', '2026-10-20 09:41:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('9a666189-d582-43b3-b176-36f00022781e', 'usr-e155cfd0', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 09:41:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('dd8d4589-6cfd-45ba-aeba-45ea36eeaab4', 'usr-596f2a7a', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 09:59:09');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f71a034d-9289-43b3-9bf7-03e02d60a279', 'usr-596f2a7a', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 09:59:10');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('ca08dd9a-b442-4883-ab16-fefd353b4827', 'usr-c3e1f6b5', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 09:59:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f8101322-6c0f-4ba5-bd3b-4bf46f7a8245', 'usr-c3e1f6b5', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 09:59:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0b5b46ed-6d7a-4ca0-ac87-09e91b20261e', 'usr-1da263d4', 50, 'project_submit', 'prj-b9fda70f', 'Submitted project: Pulse Analytics', '2026-10-20 09:59:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('afa843ca-7fad-452f-8a0f-d5cef5243a32', 'usr-1da263d4', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 09:59:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('aa1b413d-f5f7-4a69-b5e7-4efc4f153abc', 'usr-1da263d4', 5, 'project_submit', 'vote-prj-b9fda70f', 'Voted on community project', '2026-10-20 09:59:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('30dc6fd4-b288-4e69-a249-ac3c8a7f9345', 'usr-1da263d4', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 09:59:13');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0433aeed-8b42-442e-938d-f0f87c754f58', 'usr-ce837f2b', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 10:00:14');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('b93170ed-75f1-42e7-aed4-6f579f8d0ae5', 'usr-ce837f2b', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 10:00:14');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c1253aa1-6771-4a1f-a3c4-e3ab52b3dd8f', 'usr-c419646d', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 10:00:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('930ea207-1b62-4067-9286-a1c2708d7a10', 'usr-c419646d', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 10:00:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('4bf07b27-7457-404f-bfef-0f80429503d1', 'usr-3a068fd1', 50, 'project_submit', 'prj-f1d386b9', 'Submitted project: Pulse Analytics', '2026-10-20 10:00:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('6a6a0ccf-8423-47a2-9dce-7941dbea0fce', 'usr-3a068fd1', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 10:00:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e1688c6e-367f-47d3-9514-575ef5fd8fa2', 'usr-3a068fd1', 5, 'project_submit', 'vote-prj-f1d386b9', 'Voted on community project', '2026-10-20 10:00:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c4379aeb-1abe-4de7-9909-818cf648e113', 'usr-3a068fd1', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 10:00:17');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('bd97d18c-b892-430f-8d7e-0d2a9aa1ca68', 'usr-ayesha', 50, 'project_submit', 'prj-3ee07bb7', 'Submitted project: Emergency E-Card', '2026-10-20 10:24:21');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e45d382b-9ed7-470d-b783-01b676e413ff', 'usr-ayesha', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 10:24:21');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('8b3d90fe-5f8d-4567-80a1-719f50ca0876', 'usr-3291f84a', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 10:24:30');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('65786f55-d147-47c7-8cc8-f3b7d6b74311', 'usr-3291f84a', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 10:24:30');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c76251ab-bf83-435f-bfa9-30b47f1a7a5d', 'usr-481e6138', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 10:24:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d0f1dfc4-8df8-4dab-b2c5-37d31558f302', 'usr-481e6138', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 10:24:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e61cc90c-2e45-4e33-94f6-37bd16666871', 'usr-07a0383c', 50, 'project_submit', 'prj-11864b1c', 'Submitted project: Pulse Analytics', '2026-10-20 10:24:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('47663228-9666-4240-b64e-342517b1a2de', 'usr-07a0383c', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 10:24:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c49da73c-4f9d-4a1e-a63e-cbb94e6c01a6', 'usr-07a0383c', 5, 'project_submit', 'vote-prj-11864b1c', 'Voted on community project', '2026-10-20 10:24:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('20a8b95a-b7e7-45d4-8f3c-624f094b5773', 'usr-07a0383c', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 10:24:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('50a3ef1a-fb0d-4170-8d43-580b7f0cec1c', 'usr-a37255bb', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 10:25:55');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('8532049a-1197-4ea4-896a-4aa2197b1993', 'usr-a37255bb', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 10:25:55');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e2e3e865-6ca6-4acb-a362-c30e78adde95', 'usr-6628001f', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 10:25:58');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('32d2f2f8-ee7a-43be-80d1-dcae0785e5bb', 'usr-6628001f', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 10:25:58');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('018a2faa-5d8c-41e2-b2da-936f1e078e65', 'usr-2c868f8c', 50, 'project_submit', 'prj-ac201fa4', 'Submitted project: Pulse Analytics', '2026-10-20 10:25:59');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('5efb14a8-fbd5-47d0-9445-85eb775a298c', 'usr-2c868f8c', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 10:25:59');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('2db266f1-5d45-4bea-bfcd-782a8255bc21', 'usr-2c868f8c', 5, 'project_submit', 'vote-prj-ac201fa4', 'Voted on community project', '2026-10-20 10:25:59');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('3ee6d06d-caad-49b8-8a4b-f60531a6ec7d', 'usr-2c868f8c', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 10:25:59');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('4ea370eb-28f6-4e8f-b508-a91023dd5fad', 'usr-ayesha', 50, 'project_submit', 'prj-6f02a3b5', 'Submitted project: Lively!', '2026-10-20 10:30:29');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('bd349b99-b2b5-4344-809c-ab33f11d8922', 'usr-92c4d906', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 10:31:26');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0e6ad0ca-50a0-4f32-a41b-fd53d79fa09c', 'usr-92c4d906', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 10:31:26');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f1249155-86bc-4475-8d5f-c18817a973a9', 'usr-5dc98264', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 10:31:30');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('fcecdb99-0b24-438b-a8aa-15c694b59e00', 'usr-5dc98264', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 10:31:30');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('83c3712a-967f-4f24-809a-2dd51a62682b', 'usr-502ad689', 50, 'project_submit', 'prj-b558bfde', 'Submitted project: Pulse Analytics', '2026-10-20 10:31:30');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0b6272de-48b8-4b6f-988b-7bec746f75f1', 'usr-502ad689', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 10:31:30');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('b3ffaf7d-6648-49f7-be53-8cf504ac67b4', 'usr-502ad689', 5, 'project_submit', 'vote-prj-b558bfde', 'Voted on community project', '2026-10-20 10:31:30');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('19101fc1-a5b6-4edd-8e02-f09397fc1740', 'usr-502ad689', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 10:31:30');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0c5796c5-e02d-4b82-a6bb-68d898a5d1dc', 'usr-8903a3f8', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 10:41:12');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('89717e9b-e788-4f41-b977-0f5ed01a8800', 'usr-8903a3f8', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 10:41:12');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a3e6256c-299e-4682-bcf5-6a4690900cd2', 'usr-68c022ec', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 10:41:15');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('44241270-097a-4e05-98d7-1e163dc63767', 'usr-68c022ec', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 10:41:15');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('5950b7c1-d0cc-4235-9120-d435602e1b53', 'usr-dd4e2eee', 50, 'project_submit', 'prj-b1803ee1', 'Submitted project: Pulse Analytics', '2026-10-20 10:41:16');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c7eeefb0-7045-43e8-af31-4ed18e193c5e', 'usr-dd4e2eee', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 10:41:16');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('e66222ae-3e7b-422a-94b6-e78c3983769f', 'usr-dd4e2eee', 5, 'project_submit', 'vote-prj-b1803ee1', 'Voted on community project', '2026-10-20 10:41:16');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d59dce0e-395b-4ccd-b54f-081fcfe6868b', 'usr-dd4e2eee', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 10:41:16');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d0ce11b5-4113-417a-9135-5866fece24d6', 'usr-d7c89a66', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 10:44:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('99851720-451a-40af-b50a-fa7069fda3d3', 'usr-d7c89a66', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 10:44:47');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f0d4ab99-a3a9-454a-95f4-050e376921ce', 'usr-334b1c53', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 10:44:51');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('765af93c-0013-4642-90a5-1947009e821b', 'usr-334b1c53', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 10:44:51');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('ae5c117a-f3d1-447a-bf40-4c698d1707ca', 'usr-2a08125c', 50, 'project_submit', 'prj-c01192bf', 'Submitted project: Pulse Analytics', '2026-10-20 10:44:51');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('dde2650e-b7ea-4c4a-a877-6e0dbf869396', 'usr-2a08125c', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 10:44:51');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('11f76e12-9180-4100-a24b-688571b730ab', 'usr-2a08125c', 5, 'project_submit', 'vote-prj-c01192bf', 'Voted on community project', '2026-10-20 10:44:51');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('b6dd3322-040c-4bcd-9141-8c7030374f76', 'usr-2a08125c', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 10:44:51');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('48ce32ce-2703-450d-9cf3-1a8bc3d34402', 'usr-9d24b4a4', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 10:49:16');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0308580c-3c5a-44d9-a6c0-e9073c24b34c', 'usr-9d24b4a4', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 10:49:16');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('12ddbd8d-2924-47d7-a850-3656faae41b1', 'usr-b722fdc1', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 10:49:19');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0f4ac7ce-1886-4655-a596-cd7f5ab3793e', 'usr-b722fdc1', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 10:49:19');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('c5ff885c-1f7f-4c57-9385-3b15bb9423b2', 'usr-9abf4eb1', 50, 'project_submit', 'prj-c9905914', 'Submitted project: Pulse Analytics', '2026-10-20 10:49:19');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('4e81e10a-01b3-44a7-ad53-e80aa1afa2ca', 'usr-9abf4eb1', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 10:49:19');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('fe9b87e1-3a8d-4023-b0ee-e589b9df062a', 'usr-9abf4eb1', 5, 'project_submit', 'vote-prj-c9905914', 'Voted on community project', '2026-10-20 10:49:19');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('b7e61926-7274-412e-809c-3a5d920cdcc8', 'usr-9abf4eb1', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 10:49:19');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('d710ceda-e072-49aa-8f97-92ca52db6576', 'usr-c48a5aa8', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 11:12:19');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('0c24dab2-bab8-48ae-990d-ebee8fd2ccf9', 'usr-c48a5aa8', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 11:12:19');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('cefcbd74-9ff3-463b-a37b-9b679ceee36d', 'usr-db03d368', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 11:12:23');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('60746c04-0a4f-4af7-9ab3-e1de8fe8f21e', 'usr-db03d368', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 11:12:23');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('3626e894-75c5-45e2-b7c0-90636cee54a0', 'usr-c4e96177', 50, 'project_submit', 'prj-bb60ef87', 'Submitted project: Pulse Analytics', '2026-10-20 11:12:23');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('4a4cb794-803f-407f-8225-7b4b0cdb03b4', 'usr-c4e96177', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 11:12:23');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('135e245d-c7eb-41e6-aac7-eff5f1ed306b', 'usr-c4e96177', 5, 'project_submit', 'vote-prj-bb60ef87', 'Voted on community project', '2026-10-20 11:12:23');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('88e4d275-72a0-481b-b067-cc352eafcb25', 'usr-c4e96177', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 11:12:23');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('ce65852a-c63c-4453-9af7-24e2929ec9cd', 'usr-a62809e9', 10, 'lesson_complete', 'lesson-cs50-1', 'Completed reading lesson', '2026-10-20 12:55:31');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a76e3aac-9b12-4608-b5ea-39469c5d2269', 'usr-a62809e9', 25, 'achievement_unlock', 'ach-first-step', 'Unlocked achievement: First Step', '2026-10-20 12:55:31');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('618692a7-db9b-47de-ac9c-b10a3b452834', 'usr-5defa171', 25, 'challenge_pass', 'challenge-two-sum', 'Passed challenge Two Sum', '2026-10-20 12:55:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('625f10ee-5165-484a-8123-33f096922300', 'usr-5defa171', 50, 'achievement_unlock', 'ach-code-solver', 'Unlocked achievement: Code Solver', '2026-10-20 12:55:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('9aaa3910-efd2-41d5-8cc9-1c198007b9e6', 'usr-1db229a1', 50, 'project_submit', 'prj-786aef80', 'Submitted project: Pulse Analytics', '2026-10-20 12:55:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('9f7b865b-d830-4065-8eb0-81293f5dfdb5', 'usr-1db229a1', 100, 'achievement_unlock', 'ach-builder', 'Unlocked achievement: Project Builder', '2026-10-20 12:55:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('a0e02196-c08d-4c1f-8c3c-08686b581a49', 'usr-1db229a1', 5, 'project_submit', 'vote-prj-786aef80', 'Voted on community project', '2026-10-20 12:55:34');
INSERT INTO xp_ledger (id, user_id, amount, source_type, reference_id, note, created_at) VALUES ('f1f48b70-b528-42c4-9447-e196aab33164', 'usr-1db229a1', 15, 'achievement_unlock', 'ach-supporter', 'Unlocked achievement: Community Pillar', '2026-10-20 12:55:34');

-- Table: achievements
CREATE TABLE achievements (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      badge_icon TEXT DEFAULT 'trophy',
      xp_bonus INTEGER DEFAULT 50,
      condition_type TEXT NOT NULL,
      condition_value INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

INSERT INTO achievements (id, key, title, description, badge_icon, xp_bonus, condition_type, condition_value, created_at) VALUES ('ach-first-step', 'first_step', 'First Step', 'Complete your first verified reading lesson in Dev Harbour.', 'book-open', 25, 'lessons_completed', 1, '2026-10-20 07:06:29');
INSERT INTO achievements (id, key, title, description, badge_icon, xp_bonus, condition_type, condition_value, created_at) VALUES ('ach-scholar', 'scholar', 'Dedicated Scholar', 'Complete at least 3 reading lessons across any course tracks.', 'award', 50, 'lessons_completed', 3, '2026-10-20 07:06:29');
INSERT INTO achievements (id, key, title, description, badge_icon, xp_bonus, condition_type, condition_value, created_at) VALUES ('ach-code-solver', 'code_solver', 'Code Solver', 'Successfully pass your first coding challenge with all test cases verified.', 'terminal', 50, 'challenges_passed', 1, '2026-10-20 07:06:29');
INSERT INTO achievements (id, key, title, description, badge_icon, xp_bonus, condition_type, condition_value, created_at) VALUES ('ach-algorithmist', 'algorithmist', 'Algorithmist', 'Pass 3 or more coding challenges.', 'cpu', 75, 'challenges_passed', 3, '2026-10-20 07:06:29');
INSERT INTO achievements (id, key, title, description, badge_icon, xp_bonus, condition_type, condition_value, created_at) VALUES ('ach-builder', 'builder', 'Project Builder', 'Submit a live project to the Dev Harbour Featured Projects directory.', 'folder-plus', 100, 'projects_submitted', 1, '2026-10-20 07:06:29');
INSERT INTO achievements (id, key, title, description, badge_icon, xp_bonus, condition_type, condition_value, created_at) VALUES ('ach-supporter', 'supporter', 'Community Pillar', 'Cast an upvote on a peer developer''s project submission.', 'heart', 15, 'projects_voted', 1, '2026-10-20 07:06:29');

-- Table: user_achievements
CREATE TABLE user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
      unlocked_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, achievement_id)
    );

INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('3b1ddeaa-66d6-4235-9864-af7eb6893373', 'usr-5dd58e4b', 'ach-first-step', '2026-10-20 07:32:02');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('24e4036b-a2a7-4cee-96ab-e27d8816f4e6', 'usr-6788c2a6', 'ach-first-step', '2026-10-20 07:56:01');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('7f014cc5-3f7d-4da8-aca1-620e1beed54e', 'usr-4ab882a5', 'ach-builder', '2026-10-20 07:56:05');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('857289f3-f430-44f6-81d3-dd11f56ec0f2', 'usr-4ab882a5', 'ach-supporter', '2026-10-20 07:56:05');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('560aa9cd-6ee4-4e49-902c-a21cecf03b31', 'usr-1bc223a4', 'ach-first-step', '2026-10-20 07:57:35');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('56993e8c-fb7d-450c-abaa-cff887f92a24', 'usr-6d7c113c', 'ach-code-solver', '2026-10-20 07:57:38');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('b22fef0f-92cf-43ec-abf0-a303b19ed169', 'usr-8cb67e6b', 'ach-builder', '2026-10-20 07:57:38');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('4d8b9e83-74d7-45e4-9789-17315e8f024d', 'usr-8cb67e6b', 'ach-supporter', '2026-10-20 07:57:38');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('5cd5f9f0-6ae2-4776-85e2-b32bbd7cfa06', 'usr-865d1581', 'ach-first-step', '2026-10-20 07:58:13');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('97dafa74-51ca-41a6-b391-d17e09757bb5', 'usr-18368ae6', 'ach-code-solver', '2026-10-20 07:58:16');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('615c2204-f3d8-401f-a10f-0bd73bc2a79e', 'usr-f38d3cef', 'ach-builder', '2026-10-20 07:58:17');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('f0c72a0b-c40a-41ed-8bbd-974ce5267970', 'usr-f38d3cef', 'ach-supporter', '2026-10-20 07:58:17');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('6a31b51b-9f4c-44d6-85e3-12583bd70c19', 'usr-bb7465ba', 'ach-first-step', '2026-10-20 08:11:44');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('341c1506-0846-4b47-9628-92824a3627d2', 'usr-26836243', 'ach-code-solver', '2026-10-20 08:11:48');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('3a1256a8-c559-41ab-a7e7-7ae49105a054', 'usr-258d9c44', 'ach-builder', '2026-10-20 08:11:48');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('2a4cdfef-bb18-4e68-85e9-579ac2da3ed9', 'usr-258d9c44', 'ach-supporter', '2026-10-20 08:11:48');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('1fcbef54-51cc-40f2-a6ee-4f0a2e5dab10', 'usr-ddc024ae', 'ach-first-step', '2026-10-20 08:35:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('086fe3ba-3d95-4c39-88e9-f51c78f8a3b3', 'usr-24979f7f', 'ach-code-solver', '2026-10-20 08:35:50');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('9e856906-f573-4c4d-a0b9-048edea5c9c0', 'usr-b80e1d3e', 'ach-builder', '2026-10-20 08:35:50');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('0f3eb906-6184-45e3-aea1-1b0557e15bc5', 'usr-b80e1d3e', 'ach-supporter', '2026-10-20 08:35:50');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('67dc8614-e1b9-4789-a6be-bf0a867777ca', 'usr-0eac25e4', 'ach-first-step', '2026-10-20 08:39:35');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('c67e5b9c-83fb-4fde-9b02-995d11a762c8', 'usr-aba7424c', 'ach-code-solver', '2026-10-20 08:39:39');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('ec3ba6df-ccd6-4e97-9ed4-034825e644ce', 'usr-225952dc', 'ach-builder', '2026-10-20 08:39:39');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('5247399b-47c4-4e8d-9955-158d6944d151', 'usr-225952dc', 'ach-supporter', '2026-10-20 08:39:39');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('fd842a29-78bf-4401-83ea-d6e74fe8b860', 'usr-128e7287', 'ach-first-step', '2026-10-20 09:00:21');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('338845cb-dbe6-45b1-b491-757574357f0d', 'usr-2787ac99', 'ach-code-solver', '2026-10-20 09:00:24');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('42ee4f45-2167-44a6-aabb-3039afad3c79', 'usr-e05e9cb2', 'ach-builder', '2026-10-20 09:00:24');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('67ba8f92-b5d0-47f1-8211-a8302a0ac444', 'usr-e05e9cb2', 'ach-supporter', '2026-10-20 09:00:24');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('c9474000-8894-49f0-a4a9-44525c425856', 'usr-731014a9', 'ach-first-step', '2026-10-20 09:09:44');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('09e17aa1-b1f5-4941-8361-8fbbfd7dc0d9', 'usr-5c994333', 'ach-code-solver', '2026-10-20 09:09:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('260d0e40-13f0-4f7e-b5cc-b58a32d5d2f9', 'usr-f8cdaf01', 'ach-builder', '2026-10-20 09:09:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('37c538ec-661c-4250-a540-f1b927438f34', 'usr-f8cdaf01', 'ach-supporter', '2026-10-20 09:09:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('868f4b14-5885-4696-b611-ab5498068356', 'usr-24a19883', 'ach-first-step', '2026-10-20 09:10:22');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('f7eab34d-92af-42d1-9eaf-81e1b27056cc', 'usr-8253842d', 'ach-code-solver', '2026-10-20 09:10:25');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('d112bd7b-530a-43bd-addd-e1a7aaae93de', 'usr-4acb5d2a', 'ach-builder', '2026-10-20 09:10:25');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('cb0e7e0e-9e39-4362-98d1-7fd255f4a281', 'usr-4acb5d2a', 'ach-supporter', '2026-10-20 09:10:25');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('e9756886-5620-4a13-aa51-2d89bc184c2a', 'usr-eba1faa1', 'ach-first-step', '2026-10-20 09:12:09');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('1983a815-d0d3-484e-b07d-65ce0f7bd186', 'usr-6a70d6e6', 'ach-code-solver', '2026-10-20 09:12:12');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('6be4d41a-b0c5-43d5-878d-f34948573856', 'usr-56cef437', 'ach-builder', '2026-10-20 09:12:13');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('ff1baf95-ff38-4399-8bda-767a6eab6564', 'usr-56cef437', 'ach-supporter', '2026-10-20 09:12:13');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('739a88de-8201-46a8-85b2-410a93899c25', 'usr-a29aa3a0', 'ach-first-step', '2026-10-20 09:20:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('ac8207f3-3f22-4357-9f33-003a0b32e8b8', 'usr-a6e8eb39', 'ach-code-solver', '2026-10-20 09:20:50');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('4ed792c5-a936-435e-9a88-5e4983ceff3c', 'usr-737926e9', 'ach-builder', '2026-10-20 09:20:50');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('651f3ba3-2d50-4c89-9edb-8a4605e94ecc', 'usr-737926e9', 'ach-supporter', '2026-10-20 09:20:51');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('b26927e5-80f1-4020-88d4-5b80cd2a265a', 'usr-b7501abc', 'ach-first-step', '2026-10-20 09:41:44');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('3d68425c-11e9-4b82-990d-bef182acab24', 'usr-524e0b5a', 'ach-code-solver', '2026-10-20 09:41:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('c5f0b6d8-16c9-40b4-8ad9-d1b64519fa9b', 'usr-e155cfd0', 'ach-builder', '2026-10-20 09:41:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('fe7678c1-89c5-4719-9ec3-8aea5ab08269', 'usr-e155cfd0', 'ach-supporter', '2026-10-20 09:41:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('fb2f66bd-0907-49e5-99ab-118abf3240ee', 'usr-596f2a7a', 'ach-first-step', '2026-10-20 09:59:10');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('601697b1-57da-41ec-a5bd-7cc491fa16b2', 'usr-c3e1f6b5', 'ach-code-solver', '2026-10-20 09:59:13');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('37e4df00-be6f-43f0-8bcf-968acbd6243e', 'usr-1da263d4', 'ach-builder', '2026-10-20 09:59:13');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('6ac2e2d9-821b-415d-83f4-8f03865a6cec', 'usr-1da263d4', 'ach-supporter', '2026-10-20 09:59:13');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('7e103ba9-0b79-4498-8302-9864747896a5', 'usr-ce837f2b', 'ach-first-step', '2026-10-20 10:00:14');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('6bdec351-3d95-477f-b52f-d9377778cd67', 'usr-c419646d', 'ach-code-solver', '2026-10-20 10:00:17');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('91979053-83f9-41c5-b3fc-c96a6d729423', 'usr-3a068fd1', 'ach-builder', '2026-10-20 10:00:17');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('dcf359c2-7fd7-4f78-b9d9-fdffb59748a5', 'usr-3a068fd1', 'ach-supporter', '2026-10-20 10:00:17');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('0ff04165-fed8-4786-84a6-84b36a403402', 'usr-ayesha', 'ach-builder', '2026-10-20 10:24:21');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('2fe445ed-9475-4e85-a56f-9bcf10ca7cf0', 'usr-3291f84a', 'ach-first-step', '2026-10-20 10:24:30');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('e2705a36-bd14-4eae-9701-aa51610d4157', 'usr-481e6138', 'ach-code-solver', '2026-10-20 10:24:34');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('ad970c29-e87f-44e1-a12c-2dc0fd68812e', 'usr-07a0383c', 'ach-builder', '2026-10-20 10:24:34');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('3b5b1cf5-4cbd-409c-ad48-d7fd230dd3dd', 'usr-07a0383c', 'ach-supporter', '2026-10-20 10:24:34');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('bc026da0-91ac-4e24-823f-78cef4c80fc3', 'usr-a37255bb', 'ach-first-step', '2026-10-20 10:25:55');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('56da60f1-9875-44b4-bfc9-999d8b8e2e30', 'usr-6628001f', 'ach-code-solver', '2026-10-20 10:25:58');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('ff938f01-9fd1-4f58-a48f-3059dff47b83', 'usr-2c868f8c', 'ach-builder', '2026-10-20 10:25:59');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('01573421-a73f-4eb6-a95a-ac9e682d0704', 'usr-2c868f8c', 'ach-supporter', '2026-10-20 10:25:59');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('bbe5df86-7bf2-475d-b24b-9595b352d074', 'usr-92c4d906', 'ach-first-step', '2026-10-20 10:31:26');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('997664e3-ef1f-4a68-91fd-13aa111e4b3b', 'usr-5dc98264', 'ach-code-solver', '2026-10-20 10:31:30');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('a29d9ab5-519e-49de-82bb-640b1272d7cd', 'usr-502ad689', 'ach-builder', '2026-10-20 10:31:30');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('7e225fc0-0abe-4bc7-972f-cb327fd730fd', 'usr-502ad689', 'ach-supporter', '2026-10-20 10:31:30');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('93be8437-8eb9-49e6-939b-aa086a1899d3', 'usr-8903a3f8', 'ach-first-step', '2026-10-20 10:41:12');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('5adb0bf1-6788-4c45-8571-c81b67d8ffde', 'usr-68c022ec', 'ach-code-solver', '2026-10-20 10:41:15');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('ce5c9d2d-cd6a-4bae-9de2-ce26ddd75db0', 'usr-dd4e2eee', 'ach-builder', '2026-10-20 10:41:16');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('8b7755ab-92e1-4311-80db-6bdd7e139e0d', 'usr-dd4e2eee', 'ach-supporter', '2026-10-20 10:41:16');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('75cca4fc-017b-4756-aee1-a196566f6c79', 'usr-d7c89a66', 'ach-first-step', '2026-10-20 10:44:47');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('5593ff55-86b5-45b0-90ff-864452aa9dcf', 'usr-334b1c53', 'ach-code-solver', '2026-10-20 10:44:51');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('2eca4b9a-7ac1-48bf-b094-894d2da9f892', 'usr-2a08125c', 'ach-builder', '2026-10-20 10:44:51');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('191e1d9b-48ec-4743-8f1e-206639d062a9', 'usr-2a08125c', 'ach-supporter', '2026-10-20 10:44:51');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('4a96dcb7-49aa-41f4-a74c-f03127ff39d9', 'usr-9d24b4a4', 'ach-first-step', '2026-10-20 10:49:16');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('a73917e1-5cbd-4d9c-8aa8-7278e3b42892', 'usr-b722fdc1', 'ach-code-solver', '2026-10-20 10:49:19');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('f1d76e22-d25f-4607-b85a-83be341d6036', 'usr-9abf4eb1', 'ach-builder', '2026-10-20 10:49:19');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('0f538c99-1987-425f-a321-e4a5f3e9db6e', 'usr-9abf4eb1', 'ach-supporter', '2026-10-20 10:49:19');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('426213da-c68f-49b0-b072-2fff5bc417a6', 'usr-c48a5aa8', 'ach-first-step', '2026-10-20 11:12:19');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('c0780b2a-6e91-41ab-81cf-7c895acc803f', 'usr-db03d368', 'ach-code-solver', '2026-10-20 11:12:23');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('5d8982d1-4d43-4ac8-9323-471e6c086a5a', 'usr-c4e96177', 'ach-builder', '2026-10-20 11:12:23');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('d31d915e-601a-49c6-8153-53945612b8d0', 'usr-c4e96177', 'ach-supporter', '2026-10-20 11:12:23');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('cb738dad-cb7a-4ddb-9268-c17cf165f4e2', 'usr-a62809e9', 'ach-first-step', '2026-10-20 12:55:31');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('71541419-36af-4223-a58e-72b220721e49', 'usr-5defa171', 'ach-code-solver', '2026-10-20 12:55:34');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('15ee0282-901e-44bd-b96d-8933d3faed07', 'usr-1db229a1', 'ach-builder', '2026-10-20 12:55:34');
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES ('1cc0bafa-2148-4de2-9d84-1cdcdaaab869', 'usr-1db229a1', 'ach-supporter', '2026-10-20 12:55:34');

-- Table: projects
CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      tech_stack_json TEXT NOT NULL DEFAULT '[]',
      repo_url TEXT NOT NULL,
      demo_url TEXT DEFAULT '',
      votes_count INTEGER DEFAULT 0,
      bookmarks_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-orbit-notes', 'usr-admin-parth', 'Orbit Notes', 'Markdown notes application with real-time multi-device sync and KaTeX math rendering.', 'Web', '["JavaScript","Markdown","WebSockets"]', 'https://github.com/RujulaSharma/devharbour.in', 'https://devharbour.in', 0, 0, 'approved', '2026-10-20 07:06:29', '2026-10-20 07:06:29');
INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-tide', 'usr-ayesha', 'Tide Habit Tracker', 'A gentle, privacy-first habit tracker with streak analytics and SQLite persistence.', 'Mobile', '["React Native","SQLite","Notifications"]', 'https://github.com/RujulaSharma/devharbour.in', 'https://devharbour.in', 0, 0, 'approved', '2026-10-20 07:06:29', '2026-10-20 07:06:29');
INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-hullcheck', 'usr-mei', 'Hullcheck Port Scanner', 'An educational network socket inspector and port reconnaissance tool for cybersecurity students.', 'Security', '["Python","Sockets","Networking"]', 'https://github.com/RujulaSharma/devharbour.in', 'https://devharbour.in', 0, 0, 'approved', '2026-10-20 07:06:29', '2026-10-20 07:06:29');
INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-3ee07bb7', 'usr-ayesha', 'Emergency E-Card', 'Full-stack emergency response app with medical profile, SOS alerts, nearby responders and live location sharing.', 'Web', '["React","Node.js","Express","MongoDB"]', 'https://github.com/mohammed-hasan-ECE/emergency-e-card', 'https://emergency-e-card-1.onrender.com', 0, 0, 'approved', '2026-10-20 10:24:21', '2026-10-20 10:24:21');
INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-6f02a3b5', 'usr-ayesha', 'Lively!', 'A community app for writers to publish stories, poems, quotes and journals, and find readers who actually read.', 'Mobile', '["Android","React Native","Mobile","Node.js"]', 'https://www.readinlively.com', 'https://www.readinlively.com', 0, 0, 'approved', '2026-10-20 10:30:29', '2026-10-20 10:30:29');
INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-pipos', 'usr-admin-parth', 'PipOS — Candy Dreams', 'A playful pastel dream-world web app with a dream arcade, lullaby music box, dream journal, star store and an animated companion called Pip.', 'Web, Game', '["Web","Game","JavaScript","Audio API","Canvas"]', 'https://shimmering-sherbet-b774ae.netlify.app', 'https://shimmering-sherbet-b774ae.netlify.app', 0, 0, 'approved', '2026-10-20 11:05:34', '2026-10-20 11:05:34');
INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-pixel-reef', 'usr-admin-parth', 'Pixel Reef', 'An underwater 2D canvas platformer engine.', 'Game', '["Canvas","Physics","JavaScript"]', 'https://github.com/RujulaSharma/devharbour.in', 'https://devharbour.in', 0, 0, 'approved', '2026-10-20 11:05:34', '2026-10-20 11:05:34');
INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-lantern', 'usr-admin-parth', 'Lantern', 'Accessible docs and API reference generator.', 'Web', '["Web","Docs","Markdown"]', 'https://github.com/RujulaSharma/devharbour.in', 'https://devharbour.in', 0, 0, 'approved', '2026-10-20 11:05:34', '2026-10-20 11:05:34');
INSERT INTO projects (id, user_id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count, bookmarks_count, status, created_at, updated_at) VALUES ('prj-relay', 'usr-admin-parth', 'Relay', 'Real-time hackathon team coordination space.', 'Web', '["WebSockets","Web","Collaboration"]', 'https://github.com/RujulaSharma/devharbour.in', 'https://devharbour.in', 0, 0, 'approved', '2026-10-20 11:05:34', '2026-10-20 11:05:34');

-- Table: project_votes
CREATE TABLE project_votes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, project_id)
    );

-- Table: project_bookmarks
CREATE TABLE project_bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, project_id)
    );

PRAGMA foreign_keys = ON;
