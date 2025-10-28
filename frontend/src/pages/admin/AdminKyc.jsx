// src/pages/admin/AdminKyc.jsx
import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Box,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import { fetchPendingKyc, approveKyc, rejectKyc } from "../../lib/admin";

const uploadBase = import.meta.env.VITE_UPLOAD_BASE;

const THEME = {
  bgLight: "#8dcaffff",
  blueSoft: "#fff",
  blueMid: "#379EFF",
  blueDeep: "#1C2F4A",
  textMain: "#1C2F4A",
  white: "#fff",
  grayLine: "rgba(242, 237, 237, 0.1)",
  success: "#A8F0C6",
  danger: "#E34A4A",
};

export default function AdminKyc() {
  const [users, setUsers] = useState([]);
  const [noteDraft, setNoteDraft] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = () =>
    fetchPendingKyc()
      .then((data) => {
        setUsers(data);
        setError("");
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "โหลดรายการไม่สำเร็จ");
      });

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleApprove(userId) {
    setError("");
    setSuccess("");
    await approveKyc(userId);
    setSuccess("✅ อนุมัติสำเร็จ");
    loadUsers();
  }

  async function handleReject(userId) {
    setError("");
    setSuccess("");
    await rejectKyc(userId, noteDraft[userId] || "");
    setSuccess("❌ ปฏิเสธสำเร็จ");
    loadUsers();
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, #2d7cf2ff 0%, #5DB3FF 60%, #ffffff 100%)`,
        boxShadow: "0 8px 20px rgba(33, 150, 243, 0.15)", // เงาอ่อนฟ้า
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: THEME.blueMid,
              boxShadow: "0 0 10px rgba(17, 17, 18, 0.3)",
            }}
          >
            <NightlightRoundIcon sx={{ fontSize: 22, color: "#fff" }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              color: "#fff",
              letterSpacing: 0.3,
            }}
          >
            ตรวจสอบคำขอ KYC
          </Typography>
        </Stack>
      </Stack>

      {/* Alerts */}
      <Stack mt={2} mb={1} gap={1}>
        {success && (
          <Typography
            sx={{
              color: "#064E1F",
              bgcolor: THEME.success,
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              fontWeight: 700,
              width: "fit-content",
            }}
          >
            {success}
          </Typography>
        )}
        {error && (
          <Typography
            sx={{
              color: "#631313",
              bgcolor: "rgba(227, 74, 74, 0.1)",
              border: "1px solid rgba(227,74,74,0.3)",
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              fontWeight: 700,
              width: "fit-content",
            }}
          >
            {error}
          </Typography>
        )}
      </Stack>

      {/* รายการผู้ใช้ */}
      {users.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            color: THEME.textMain,
            borderRadius: 3,
            border: `1px dashed ${THEME.grayLine}`,
            background: "#fff",
            mt: 2,
          }}
        >
          ไม่มีรายการรออนุมัติ
        </Paper>
      ) : (
        <Stack spacing={3} mt={2}>
          {users.map((user) => (
            <Card
              key={user._id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                background: `linear-gradient(145deg, ${THEME.white} 0%, ${THEME.blueSoft} 100%)`,
                border: `1px solid ${THEME.grayLine}`,
                boxShadow: "0 6px 12px rgba(55,158,255,0.1)",
                transition: "transform .2s ease, box-shadow .2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 18px rgba(55,158,255,0.2)",
                  borderColor: THEME.blueMid,
                },
              }}
            >
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: THEME.blueMid,
                    }}
                  >
                    <AssignmentIndOutlinedIcon sx={{ color: "#fff" }} />
                  </Box>
                }
                title={
                  <Typography fontWeight={800} sx={{ color: THEME.textMain }}>
                    {user.profile?.name || "ไม่ระบุชื่อ"}
                  </Typography>
                }
                subheaderTypographyProps={{ sx: { color: "#555" } }}
                subheader={user.email}
              />
              <Divider />
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  gap={3}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  {/* ข้อมูลส่วนตัว */}
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{ color: "THEME.textMain" }}
                    >
                      DOB:{" "}
                      {user.profile?.dob
                        ? new Date(user.profile.dob).toLocaleDateString()
                        : "-"}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`Phone: ${user.profile?.phone || "-"}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: "THEME.textMain",
                          borderColor: THEME.grayLine,
                          background: "#fff",
                        }}
                      />
                      <Chip
                        label={`LINE: ${user.profile?.lineId || "-"}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: THEME.textMain,
                          borderColor: THEME.grayLine,
                          background: "#fff",
                        }}
                      />
                    </Stack>
                  </Stack>

                  {/* เอกสารแนบ */}
                  <Stack
                    alignItems={{ xs: "flex-start", sm: "flex-end" }}
                    spacing={1}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: THEME.textMain, mb: 0.5 }}
                    >
                      เอกสารแนบ
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {user.kyc?.idCardImagePath && (
                        <Button
                          size="small"
                          variant="outlined"
                          component="a"
                          href={`${uploadBase}/${user.kyc.idCardImagePath}`}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            textTransform: "none",
                            borderColor: THEME.grayLine,
                            color: THEME.textMain,
                            background: "#fff",
                            "&:hover": {
                              background: THEME.blueSoft,
                              borderColor: THEME.blueMid,
                            },
                          }}
                        >
                          บัตรประชาชน
                        </Button>
                      )}
                      {user.kyc?.selfieWithIdPath && (
                        <Button
                          size="small"
                          variant="outlined"
                          component="a"
                          href={`${uploadBase}/${user.kyc.selfieWithIdPath}`}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            textTransform: "none",
                            borderColor: THEME.grayLine,
                            color: THEME.textMain,
                            background: "#fff",
                            "&:hover": {
                              background: THEME.blueSoft,
                              borderColor: THEME.blueMid,
                            },
                          }}
                        >
                          เซลฟี่
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* หมายเหตุ + ปุ่ม */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  gap={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <TextField
                    label="หมายเหตุ (กรณีปฏิเสธ)"
                    size="small"
                    fullWidth
                    value={noteDraft[user._id] || ""}
                    onChange={(e) =>
                      setNoteDraft((prev) => ({
                        ...prev,
                        [user._id]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={() => handleApprove(user._id)}
                    sx={{
                      fontWeight: 800,
                      px: 2.5,
                      textTransform: "none",
                      backgroundColor: THEME.blueMid,
                      color: "#fff",
                      "&:hover": { backgroundColor: "#207DEB" },
                    }}
                  >
                    อนุมัติ
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={() => handleReject(user._id)}
                    sx={{
                      fontWeight: 800,
                      px: 2.5,
                      textTransform: "none",
                      backgroundColor: THEME.danger,
                      color: "#fff",
                      "&:hover": { backgroundColor: "#C43C3C" },
                    }}
                  >
                    ปฏิเสธ
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
