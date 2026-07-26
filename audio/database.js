const siteDatabase = {
    seasons: [
        {
            seasonNumber: 6,
            status: "upcoming", // Triggers the top banner
            title: "Season 6: Title TBA",
            date: "Oct 2026",
            location: "Location Name",
            posterImg: "",
            description: "We are currently planning our next gathering. Stay tuned for more details, guest announcements, and registration info!",
            highlights: [],
            tracklist: [],
            gallery: {
                folderName: "gallery_season_6",
                filePrefix: "2",
                maxImages: 0,
                maxVideos: 0
            }
        },
        {
            seasonNumber: 5,
            status: "past", // Triggers the grid cards
            title: "The Father's Love",
            date: "24/7/2026",
            location: "One Circle",
            posterImg: "1000594675.jpg",
            description: "",
            highlights: [
                "Live Worship Session",
                "Amapiano & Moyo Wangu Medleys",
                "21 Songs"
            ],
            tracklist: [
                { trackId: 1, title: "Abba Father", artist: "Trey McLaughlin", file: "audio/Track1.mp3" },
                { trackId: 2, title: "Abba", artist: "Dante Bowe", file: "audio/Track2.mp3" },
                { trackId: 3, title: "I Belong", artist: "William McDowell", file: "audio/Track3.mp3" },
                { trackId: 4, title: "How Deep The Father's Love", artist: "SELAH", file: "audio/Track4.mp3" },
                { trackId: 5, title: "Good Good Father", artist: "Housefires", file: "audio/Track5.mp3" },
                { trackId: 6, title: "I'm A Friend Of God", artist: "Israel Houghton", file: "audio/Track6.mp3" },
                { trackId: 7, title: "Who You Say I Am", artist: "Hillsong", file: "audio/Track7.mp3" },
                { trackId: 8, title: "Hallelujah", artist: "Sue Wachira", file: "audio/Track8.mp3" },
                { trackId: 9, title: "Kama Si We Baba", artist: "Kanji Mbugua", file: "audio/Track9.mp3" },
                { trackId: 10, title: "Amapiano Medley", artist: "One Circle", file: "audio/Track10.mp3" },
                { trackId: 11, title: "Moyo Wangu", artist: "Icons ft Mike Manao And Janice", file: "audio/Track11.mp3" },
                { trackId: 12, title: "Sifa Zote", artist: "Icons ft Mike Manao And Janice", file: "audio/Track12.mp3" },
                { trackId: 13, title: "Nakungoja", artist: "Icons ft Mike Manao And Janice", file: "audio/Track13.mp3" },
                { trackId: 14, title: "Juu Yako", artist: "Icons ft Mike Manao And Janice", file: "audio/Track14.mp3" },
                { trackId: 15, title: "How Much More", artist: "Jordan G Welch", file: "audio/Track15.mp3" },
                { trackId: 16, title: "Wastahili Ewe Bwana", artist: "One Circle", file: "audio/Track16.mp3" },
                { trackId: 17, title: "The Father's Love Medley", artist: "God in this music", file: "audio/Track17.mp3" },
                { trackId: 18, title: "Father Of Mercy", artist: "David Dam", file: "audio/Track18.mp3" },
                { trackId: 19, title: "Adopted", artist: "Casey J", file: "audio/Track19.mp3" },
                { trackId: 20, title: "Worthy", artist: "Trey McLaughlin - Maiko", file: "audio/Track20.mp3" },
                { trackId: 21, title: "Kaye", artist: "Wanza", file: "audio/Track21.mp3" }
            ],
            gallery: {
                folderName: "gallery_season_5",
                filePrefix: "1",
                maxImages: 150,
                maxVideos: 20
            }
        }
    ]
};
