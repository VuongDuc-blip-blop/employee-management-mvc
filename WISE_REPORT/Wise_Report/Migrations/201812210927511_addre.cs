namespace Wise_Report.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addre : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Administrator",
                c => new
                    {
                        UserId = c.Int(nullable: false, identity: true),
                        Username = c.String(nullable: false, maxLength: 64, unicode: false),
                        Password = c.String(nullable: false, maxLength: 64, unicode: false),
                        Fullname = c.String(),
                        Avatar = c.String(),
                        Isadmin = c.Boolean(nullable: false),
                        MaPhongBan = c.String(),
                    })
                .PrimaryKey(t => t.UserId);
            
            CreateTable(
                "dbo.SmartOKRs_INFO",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        DATE_TIME = c.DateTime(nullable: false),
                        MAC_ADDRESS = c.String(),
                        RED_LIGHT = c.Int(nullable: false),
                        AMBER_LIGHT = c.Int(nullable: false),
                        GREEN_LIGHT = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ID);
            
            CreateTable(
                "dbo.SmartOKRs_PRODUCTS",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        DATE_TIME = c.DateTime(nullable: false),
                        MAC_ADDRESS = c.String(),
                        SmartOKRs_INFO_ID = c.Int(),
                    })
                .PrimaryKey(t => t.ID)
                .ForeignKey("dbo.SmartOKRs_INFO", t => t.SmartOKRs_INFO_ID)
                .Index(t => t.SmartOKRs_INFO_ID);
            
            CreateTable(
                "dbo.SmartOKRs_WDR_INFO",
                c => new
                    {
                        WDR_MAC_ADDRESS = c.String(nullable: false, maxLength: 128),
                        WDR_USERNAME = c.String(),
                        WDR_STATUS = c.Boolean(nullable: false),
                        DESCRIPTION = c.String(),
                    })
                .PrimaryKey(t => t.WDR_MAC_ADDRESS);
            
            CreateTable(
                "dbo.SmartOKRs_WDT_INFO",
                c => new
                    {
                        WDT_MAC_ADDRESS = c.String(nullable: false, maxLength: 128),
                        WDT_USERNAME = c.String(),
                        WDT_STATUS = c.Boolean(nullable: false),
                        DESCRIPTION = c.String(),
                    })
                .PrimaryKey(t => t.WDT_MAC_ADDRESS);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.SmartOKRs_PRODUCTS", "SmartOKRs_INFO_ID", "dbo.SmartOKRs_INFO");
            DropIndex("dbo.SmartOKRs_PRODUCTS", new[] { "SmartOKRs_INFO_ID" });
            DropTable("dbo.SmartOKRs_WDT_INFO");
            DropTable("dbo.SmartOKRs_WDR_INFO");
            DropTable("dbo.SmartOKRs_PRODUCTS");
            DropTable("dbo.SmartOKRs_INFO");
            DropTable("dbo.Administrator");
        }
    }
}
