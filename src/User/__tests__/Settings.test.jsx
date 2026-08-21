import {
  renderHook,
  act,
  render,
  screen,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useChannelStore } from "@/Channel/stores/useChannelStore";
import axiosInstance from "@/shared/services/axiosInstance";
import Settings from "@/User/components/Settings";
import { SETTING_TYPES } from "@/User/constants/settingOptions";
import useUpdateSetting from "@/User/hooks/useUpdateSetting";
import { useUserSettingsStore } from "@/User/stores/useUserSettingsStore";

vi.mock("@/shared/services/axiosInstance", () => ({
  default: {
    patch: vi.fn(),
  },
}));

describe("UserSetting", () => {
  beforeEach(() => {
    vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue("1");
    axiosInstance.patch.mockResolvedValue({});
  });

  it("광고 감지 설정이 false일 경우, useUpdateSetting을 호출하면 설정을 true로 변경한다", async () => {
    useUserSettingsStore.setState({ userSettings: { isAdDetect: false } });

    const { result } = renderHook(() =>
      useUpdateSetting(SETTING_TYPES.AD_DETECT)
    );

    await act(async () => {
      await result.current();
    });

    expect(useUserSettingsStore.getState().userSettings.isAdDetect).toBe(true);
  });

  it("이전 채널 설정이 false일 경우, useUpdateSetting을 호출하면 설정을 true로 변경한다", async () => {
    useUserSettingsStore.setState({ userSettings: { isReturnChannel: false } });

    const { result } = renderHook(() =>
      useUpdateSetting(SETTING_TYPES.RETURN_CHANNEL)
    );

    await act(async () => {
      await result.current();
    });

    expect(useUserSettingsStore.getState().userSettings.isReturnChannel).toBe(
      true
    );
  });

  it("광고 감지가 true일 때 광고 없는 채널 선택 UI를 표시한다", () => {
    useUserSettingsStore.setState({ userSettings: { isAdDetect: true } });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.getByTestId("no-ad-channel-list")).toBeInTheDocument();
  });

  it("광고 감지가 false일 때 광고 없는 채널 선택 UI를 표시하지 않는다", () => {
    useUserSettingsStore.setState({ userSettings: { isAdDetect: false } });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("no-ad-channel-list")).not.toBeInTheDocument();
  });

  it("광고 없는 채널 중 하나만 선택된 상태로 표시한다", () => {
    useUserSettingsStore.setState({
      userSettings: {
        isAdDetect: true,
        adRedirectChannelId: 2,
      },
    });

    useChannelStore.setState({
      radioChannelList: [
        { id: 1, name: "채널 1", logoUrl: "dummy", isAdChannel: false },
        { id: 2, name: "채널 2", logoUrl: "dummy", isAdChannel: false },
      ],
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    const list = screen.getByTestId("no-ad-channel-list");
    const items = within(list).getAllByRole("listitem");

    expect(
      within(items[0]).queryByTestId("selected-no-ad-channel")
    ).not.toBeInTheDocument();

    expect(
      within(items[1]).getByTestId("selected-no-ad-channel")
    ).toBeInTheDocument();
  });
});
