-- CreateTable
CREATE TABLE `actes` (
    `communeevenement` INTEGER NULL,
    `saisi` INTEGER NULL,
    `numeroacte` INTEGER NULL,
    `dateacte` DATETIME(0) NULL,
    `pageacte` INTEGER NULL,
    `typeacte` VARCHAR(1) NULL,
    `dateevenement` VARCHAR(10) NULL,
    `notes` TEXT NULL,
    `releve` INTEGER NULL,
    `officier` INTEGER NULL,
    `communeacte` INTEGER NULL,
    `id` INTEGER NULL,
    `source` INTEGER NULL,

    INDEX `actes_communeacte`(`communeacte` ASC),
    INDEX `actes_dateacte`(`dateacte` ASC),
    INDEX `actes_id`(`id` ASC),
    INDEX `actes_typeacte`(`typeacte` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alignement` (
    `id` INTEGER NULL,
    `nom` VARCHAR(10) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `binaire` (
    `id` INTEGER NULL,
    `nom` VARCHAR(10) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communes` (
    `id` INTEGER NULL,
    `commune` VARCHAR(50) NULL,
    `codepays` VARCHAR(3) NULL,

    INDEX `communes_codepays`(`codepays` ASC),
    INDEX `communes_commune`(`commune` ASC),
    INDEX `communes_id`(`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `count` (
    `procedures` INTEGER NULL,
    `id` INTEGER NULL,
    `rois` INTEGER NULL,
    `rois2` INTEGER NULL,
    `actes` INTEGER NULL,
    `genea2` INTEGER NULL,
    `genea` INTEGER NULL,
    `personnes` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dateajout` (
    `fin` INTEGER NULL,
    `id` INTEGER NULL,
    `date` DATETIME(0) NULL,
    `tag1` VARCHAR(30) NULL,
    `tag2` VARCHAR(30) NULL,
    `debut` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diapos` (
    `id` INTEGER NULL,
    `diapo` VARCHAR(100) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emailcategs` (
    `id` INTEGER NULL,
    `categorie` VARCHAR(100) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emails` (
    `dst` TEXT NULL,
    `src` TEXT NULL,
    `id` INTEGER NULL,
    `msg` TEXT NULL,
    `categorie` INTEGER NULL,
    `date` DATETIME(0) NULL,
    `sujet` TEXT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `famille` (
    `lieu_naissance` TEXT NULL,
    `commentaires` TEXT NULL,
    `parents` INTEGER NULL,
    `refno` VARCHAR(10) NULL,
    `fampos` INTEGER NULL,
    `occupation` VARCHAR(50) NULL,
    `mere` INTEGER NULL,
    `sexe` VARCHAR(1) NULL,
    `source` TEXT NULL,
    `lettre` VARCHAR(1) NULL,
    `id` INTEGER NULL,
    `surnom` VARCHAR(50) NULL,
    `srcrefno` VARCHAR(10) NULL,
    `date_mort` VARCHAR(20) NULL,
    `prenom` VARCHAR(50) NULL,
    `lieu_mort` TEXT NULL,
    `nom` VARCHAR(50) NULL,
    `mariages` TEXT NULL,
    `pere` INTEGER NULL,
    `photo` VARCHAR(100) NULL,
    `date_naissance` VARCHAR(20) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `famille2` (
    `date_mariage` VARCHAR(20) NULL,
    `id` INTEGER NULL,
    `refno` VARCHAR(10) NULL,
    `lieu_mariage` TEXT NULL,
    `pere` INTEGER NULL,
    `mere` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gen_articles` (
    `nouveaute` INTEGER NULL,
    `usager` INTEGER NULL,
    `afficher` INTEGER NULL,
    `titre` TEXT NULL,
    `email` INTEGER NULL,
    `auteur` VARCHAR(100) NULL,
    `premiere_page` INTEGER NULL,
    `reference` TEXT NULL,
    `date` DATETIME(0) NULL,
    `rubrique` INTEGER NULL,
    `ordre` DOUBLE NULL,
    `id` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gen_rubriques` (
    `id` INTEGER NULL,
    `nom` VARCHAR(100) NULL,
    `ordre` DOUBLE NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gen_texte` (
    `texte` TEXT NULL,
    `id` INTEGER NULL,
    `image` VARCHAR(100) NULL,
    `article` INTEGER NULL,
    `sous_titre` VARCHAR(150) NULL,
    `ordre` DOUBLE NULL,
    `alignement_image` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genea` (
    `lieu_naissance` TEXT NULL,
    `commentaires` TEXT NULL,
    `parents` INTEGER NULL,
    `refno` VARCHAR(10) NULL,
    `fampos` INTEGER NULL,
    `occupation` VARCHAR(50) NULL,
    `mere` INTEGER NULL,
    `sexe` VARCHAR(1) NULL,
    `source` TEXT NULL,
    `lettre` VARCHAR(1) NULL,
    `id` INTEGER NULL,
    `surnom` VARCHAR(50) NULL,
    `srcrefno` VARCHAR(10) NULL,
    `date_mort` VARCHAR(20) NULL,
    `prenom` VARCHAR(50) NULL,
    `lieu_mort` TEXT NULL,
    `nom` VARCHAR(50) NULL,
    `mariages` TEXT NULL,
    `pere` INTEGER NULL,
    `photo` VARCHAR(100) NULL,
    `date_naissance` VARCHAR(20) NULL,

    INDEX `genea_id`(`id` ASC),
    INDEX `genea_lettre`(`lettre` ASC),
    INDEX `genea_mere`(`mere` ASC),
    INDEX `genea_nom`(`nom` ASC),
    INDEX `genea_parents`(`parents` ASC),
    INDEX `genea_pere`(`pere` ASC),
    INDEX `genea_refno`(`refno` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genea2` (
    `date_mariage` VARCHAR(20) NULL,
    `id` INTEGER NULL,
    `refno` VARCHAR(10) NULL,
    `lieu_mariage` TEXT NULL,
    `pere` INTEGER NULL,
    `mere` INTEGER NULL,

    INDEX `genea2_mere`(`mere` ASC),
    INDEX `genea2_pere`(`pere` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history` (
    `id` INTEGER NULL,
    `courriels` INTEGER NULL,
    `sujet` VARCHAR(255) NULL,
    `date` DATETIME(0) NULL,

    INDEX `history_date`(`date` ASC),
    INDEX `history_id`(`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indexlist` (
    `id` INTEGER NULL,
    `tab` VARCHAR(25) NULL,
    `flds` VARCHAR(200) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `langpref` (
    `id` INTEGER NULL,
    `lang` VARCHAR(3) NULL,
    `ip` VARCHAR(20) NULL,
    `date` DATETIME(0) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `links` (
    `id` INTEGER NULL,
    `menu` INTEGER NULL,
    `dsttab` VARCHAR(50) NULL,
    `dstfld` VARCHAR(50) NULL,
    `srctab` VARCHAR(50) NULL,
    `srcfld` VARCHAR(50) NULL,
    `idfld` VARCHAR(50) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manquants` (
    `id` INTEGER NULL,
    `commentaire` TEXT NULL,
    `typeacte` VARCHAR(1) NULL,
    `commune` INTEGER NULL,
    `annee` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membres` (
    `id` INTEGER NULL,
    `type` VARCHAR(50) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menus` (
    `id` INTEGER NULL,
    `nom` TEXT NULL,
    `code` TEXT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message` (
    `id` INTEGER NULL,
    `texte_en` TEXT NULL,
    `fond` VARCHAR(10) NULL,
    `texte_fr` TEXT NULL,
    `couleur` VARCHAR(10) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metiers` (
    `id` INTEGER NULL,
    `metier` VARCHAR(30) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `misajour` (
    `id` INTEGER NULL,
    `commune` VARCHAR(30) NULL,
    `codepays` VARCHAR(3) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `noms` (
    `nombre` INTEGER NULL,
    `nom` VARCHAR(100) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `officiers` (
    `id` INTEGER NULL,
    `nomprenom` VARCHAR(50) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pays` (
    `codepays` VARCHAR(3) NULL,
    `id` INTEGER NULL,
    `paysanglais` VARCHAR(30) NULL,
    `paysfrancais` VARCHAR(30) NULL,

    INDEX `pays_codepays`(`codepays` ASC),
    INDEX `pays_id`(`id` ASC),
    INDEX `pays_paysanglais`(`paysanglais` ASC),
    INDEX `pays_paysfrancais`(`paysfrancais` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paysusers` (
    `codepays` VARCHAR(3) NULL,
    `id` INTEGER NULL,
    `paysanglais` VARCHAR(30) NULL,
    `paysfrancais` VARCHAR(30) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personnes` (
    `age` VARCHAR(3) NULL,
    `datedenaissance` VARCHAR(10) NULL,
    `prenom` VARCHAR(40) NULL,
    `notes` TEXT NULL,
    `acte` INTEGER NULL,
    `role` INTEGER NULL,
    `profession` INTEGER NULL,
    `id` INTEGER NULL,
    `lieudenaissance` INTEGER NULL,
    `nomdefamille` VARCHAR(25) NULL,

    INDEX `personnes_acte`(`acte` ASC),
    INDEX `personnes_id`(`id` ASC),
    INDEX `personnes_lieudenaissance`(`lieudenaissance` ASC),
    INDEX `personnes_nomdefamille`(`nomdefamille` ASC),
    INDEX `personnes_prenom`(`prenom` ASC),
    INDEX `personnes_role`(`role` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedures` (
    `id` INTEGER NULL,
    `description` VARCHAR(250) NULL,
    `func` VARCHAR(20) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recrutement` (
    `id` INTEGER NULL,
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `source` VARCHAR(255) NULL,
    `added` DATETIME(0) NULL,
    `removed` DATETIME(0) NULL,

    INDEX `recrutement_email`(`email` ASC),
    INDEX `recrutement_id`(`id` ASC),
    INDEX `recrutement_name`(`name` ASC),
    INDEX `recrutement_removed`(`removed` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rois` (
    `lieu_naissance` TEXT NULL,
    `commentaires` TEXT NULL,
    `parents` INTEGER NULL,
    `refno` VARCHAR(10) NULL,
    `fampos` INTEGER NULL,
    `occupation` VARCHAR(50) NULL,
    `mere` INTEGER NULL,
    `sexe` VARCHAR(1) NULL,
    `source` TEXT NULL,
    `lettre` VARCHAR(1) NULL,
    `id` INTEGER NULL,
    `surnom` VARCHAR(50) NULL,
    `date_mort` VARCHAR(20) NULL,
    `prenom` VARCHAR(50) NULL,
    `lieu_mort` TEXT NULL,
    `nom` VARCHAR(50) NULL,
    `mariages` TEXT NULL,
    `pere` INTEGER NULL,
    `photo` VARCHAR(100) NULL,
    `date_naissance` VARCHAR(20) NULL,

    INDEX `rois_id`(`id` ASC),
    INDEX `rois_lettre`(`lettre` ASC),
    INDEX `rois_mere`(`mere` ASC),
    INDEX `rois_nom`(`nom` ASC),
    INDEX `rois_parents`(`parents` ASC),
    INDEX `rois_pere`(`pere` ASC),
    INDEX `rois_refno`(`refno` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rois2` (
    `date_mariage` VARCHAR(20) NULL,
    `id` INTEGER NULL,
    `refno` VARCHAR(10) NULL,
    `lieu_mariage` TEXT NULL,
    `pere` INTEGER NULL,
    `mere` INTEGER NULL,

    INDEX `rois2_mere`(`mere` ASC),
    INDEX `rois2_pere`(`pere` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NULL,
    `role` VARCHAR(20) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saisipar` (
    `id` INTEGER NULL,
    `nomprenom` VARCHAR(25) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `serveurs_sql` (
    `id` INTEGER NULL,
    `protocole` VARCHAR(10) NULL,
    `parametres` VARCHAR(200) NULL,
    `nom` VARCHAR(100) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `serveurs_web` (
    `id` INTEGER NULL,
    `java` INTEGER NULL,
    `nom` VARCHAR(100) NULL,
    `admin` VARCHAR(100) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sites` (
    `ftp_root` VARCHAR(20) NULL,
    `smtp_port` INTEGER NULL,
    `ftp_motpasse` VARCHAR(20) NULL,
    `sql_usager` VARCHAR(20) NULL,
    `sql_port` INTEGER NULL,
    `fournisseur` VARCHAR(100) NULL,
    `sql_ip` VARCHAR(100) NULL,
    `sql_database` VARCHAR(50) NULL,
    `sql_type` INTEGER NULL,
    `ftp_ip` VARCHAR(100) NULL,
    `id` INTEGER NULL,
    `http_admin` VARCHAR(100) NULL,
    `ftp_usager` VARCHAR(20) NULL,
    `systeme` INTEGER NULL,
    `http_type` INTEGER NULL,
    `sql_motpasse` VARCHAR(20) NULL,
    `http_ip` VARCHAR(100) NULL,
    `smtp_ip` VARCHAR(100) NULL,
    `sql_parameters` VARCHAR(200) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sources` (
    `id` INTEGER NULL,
    `liste` VARCHAR(100) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `systemes` (
    `id` INTEGER NULL,
    `nom` VARCHAR(20) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `typeacte` (
    `nom` VARCHAR(18) NULL,
    `code` VARCHAR(1) NULL,
    `id` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `membership` INTEGER NULL,
    `adresse` TEXT NULL,
    `telephone` VARCHAR(50) NULL,
    `expiration` DATETIME(0) NULL,
    `pagination` INTEGER NULL,
    `donnees` VARCHAR(20) NULL,
    `usager` VARCHAR(20) NULL,
    `email` VARCHAR(50) NULL,
    `id` INTEGER NULL,
    `prenom` VARCHAR(30) NULL,
    `admin` INTEGER NULL,
    `codepays` VARCHAR(3) NULL,
    `compagnie` VARCHAR(100) NULL,
    `permissions` TEXT NULL,
    `visites` VARCHAR(20) NULL,
    `nom` VARCHAR(30) NULL,
    `historique` TEXT NULL,
    `paypal` INTEGER NULL,
    `note_expiration` TEXT NULL,
    `url` VARCHAR(50) NULL,
    `motpasse` VARCHAR(20) NULL,
    `indexation` VARCHAR(20) NULL,
    `email_public` VARCHAR(100) NULL,
    `pays` INTEGER NULL,
    `menu` TEXT NULL,
    `conseil` INTEGER NULL,

    INDEX `users_admin`(`admin` ASC),
    INDEX `users_email`(`email` ASC),
    INDEX `users_id`(`id` ASC),
    INDEX `users_membership`(`membership` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

